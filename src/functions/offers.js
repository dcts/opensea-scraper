// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * scrapes opensea offers for a given collection.
 * INPUTS:
 *   slug [String]: collection identifier by opensea)
 *   options [Object]: {
 *     debug [Boolean]: launches chromium locally, omits headless mode (default: `false`)
 *     logs [Boolean]: display logs in the console (default: `false`)
 *     sort [Boolean]: sorts the offers by lowest to highest (default: `true`)
 *     browserInstance [PuppeteerBrowser]: bring your own browser instance for more control
 *   }
 * RETURNS:
 * object with keys "offers" (array of offer objects) and "stats" (object with metadata).
 * an offer object holds additional information, not only the floor price, example:
 * {
 *   floorPrice: {
 *     amount: 19,
 *     currency: "ETH",
 *   },
 *   name: "cool cat #231",
 *   tokenId: 234,
 *   offerUrl: "https://opensea.io/assets/0x1a92f7381b9f03921564a437210bb9396471050c/231",
 *   displayImageUrl, "https://lh3.googleusercontent.com/-vBw0jsFjmRF7hsrh26ky0XY2FXhConjTchjpKHBuj6L5Os4i9iu4Fl4ZzTjQJiMkgIEZw8hZCpK0GCUxto637wmIxOd64DSm_Y34w=w600"
 * }
 */
const offers = async (slug, optionsGiven = {}) => {
  const url = `https://opensea.io/collection/${slug}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`;
  return await offersByUrl(url, optionsGiven);
}

/**
 * use custom url to scrape offers
 * Opensea supports encoding filtering in the URL so this method is helpful for getting
 * a specific asset (for example floor price for a LAND token from the sandbox collection)
 */
const offersByUrl = async (url, optionsGiven = {}) => {
  const optionsDefault = {
    debug: false,
    logs: false,
    sort: true, // sorts the returned offers by lowest to highest price
    browserInstance: undefined,
  };
  const options = { ...optionsDefault, ...optionsGiven };
  const { debug, logs, browserInstance, sort } = options;
  const customPuppeteerProvided = Boolean(optionsGiven.browserInstance);

  // add mandatory query params
  // fixes a bug, see following link:
  // https://github.com/dcts/opensea-scraper/pull/26
  const mandatoryQueryParam = "search[toggles][0]=BUY_NOW";
  if (!url.includes(mandatoryQueryParam)) {
    const joinChar = url.includes("?") ? "&" : "?";
    url += `${joinChar}${mandatoryQueryParam}`;
  }
  logs && console.log(`=== scraping started ===\nScraping Opensea URL: ${url}`);
  logs && console.log(`\n=== options ===\ndebug          : ${debug}\nlogs           : ${logs}\nbrowserInstance: ${browserInstance ? "provided by user" : "default"}`);

  // init browser
  let browser = browserInstance;
  if (!customPuppeteerProvided) {
    browser = await puppeteer.launch({
      headless: !debug, // when debug is true => headless should be false
      args: ['--start-maximized'],
    });
  }

  logs && console.log("\n=== actions ===");
  logs && console.log("new page created");
  const page = await browser.newPage();
  logs && console.log(`opening url ${url}`);
  await page.goto(url);

  // ...🚧 waiting for cloudflare to resolve
  logs && console.log("🚧 waiting for cloudflare to resolve...");
  await page.waitForSelector('.cf-browser-verification', {hidden: true});

  // extract __wired__ variable
  logs && console.log("extracting __wired__ variable");
  const html = await page.content();
  const __wired__ = _parseWiredVariable(html);

  if (!customPuppeteerProvided && !debug) {
    logs && console.log("closing browser...");
    await browser.close();
  }

  logs && console.log("extracting offers and stats from __wired__ variable");
  return {
    offers: _extractOffers(__wired__, { sort }),
    stats: _extractStats(__wired__),
  };
}

function _parseWiredVariable(html) {
  const str = html.split("window.__wired__=")[1].split("</script>")[0];
  return JSON.parse(str);
}

function _extractStats(__wired__) {
  try {
    return {
      totalOffers: Object.values(__wired__.records).find(o => o.totalCount).totalCount,
    }
  } catch (err) {
    return "stats not availible. Report issue if you think this is a bug: https://github.com/dcts/opensea-scraper/issues/new";
  }
}
function _extractOffers(__wired__, { sort = true } = {}) {
  // create currency dict to extract different offer currencies
  const currencyDict = {};
  Object.values(__wired__.records)
    .filter(o => o.__typename === "AssetType")
    .filter(o => o.usdSpotPrice)
    .forEach(currency => {
      currencyDict[currency.id] = {
        id: currency.id,
        symbol: currency.symbol,
        imageUrl: currency.imageUrl,
        usdSpotPrice: currency.usdSpotPrice,
      }
    });

  // create contract dict to generate offerUrl
  const assetContractDict = {};
  Object.values(__wired__.records)
    .filter(o => o.__typename === "AssetContractType" && o.address)
    .forEach(o => {
      assetContractDict[o.id] = o.address;
    })

  // get all floorPrices (all currencies)
  const floorPrices = Object.values(__wired__.records)
    .filter(o => o.__typename === "AssetQuantityType")
    .filter(o => o.quantityInEth)
    .map(o => {
      return {
        amount: o.quantity / 1000000000000000000,
        currency: currencyDict[o.asset.__ref].symbol,
      }
    });

  // get offers
  const offers = Object.values(__wired__.records)
    .filter(o => o.__typename === "AssetType" && o.tokenId)
    .map(o => {
      const assetContract = _extractAssetContract(o, assetContractDict);
      const tokenId = o.tokenId;
      const contractAndTokenIdExist = Boolean(assetContract) && Boolean(tokenId);
      return {
        name: o.name,
        tokenId: tokenId,
        displayImageUrl: o.displayImageUrl,
        assetContract: assetContract,
        offerUrl: contractAndTokenIdExist ? `https://opensea.io/assets/${assetContract}/${tokenId}` : undefined,
      };
    });

  // merge information together:
  floorPrices.forEach((floorPrice, indx) => {
    offers[indx].floorPrice = floorPrice;
  });

  return sort ? _sortOffersLowToHigh(offers, currencyDict) : offers;
}

function _sortOffersLowToHigh(offers, currencyDict) {
  return offers.sort((a,b) => {
    if (!a.floorPrice) {
      return 1
    }

    if (!b.floorPrice) {
      return -1;
    }

    const getUsdValue = (offer, currencyDict) => {
      const currencySymbol = offer.floorPrice.currency;
      const targetCurrency = Object.values(currencyDict).find(o => o.symbol === currencySymbol);
      return targetCurrency.usdSpotPrice * offer.floorPrice.amount;
    }
    return getUsdValue(a, currencyDict) - getUsdValue(b, currencyDict);
  })
}

function _extractAssetContract(offerObj, assetContractDict) {
  try {
    return assetContractDict[offerObj.assetContract.__ref];
  } catch (err) {
    return undefined;
  }
}

module.exports = {
  offers,
  offersByUrl
};
