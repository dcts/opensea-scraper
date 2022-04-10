// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// load helper function to detect stealth plugin
const { warnIfNotUsingStealth } = require("../helpers/helperFunctions.js");

/**
 * scrapes opensea offers for a given collection by scrolling
 * and capturing all network traffic, then extracting
 * info from all graphql requests
 *
 * IMPORATNT: first 32 offers are identical to the offers() method
 */
const offersByScrolling = async (slug, resultSize = 100, optionsGiven = {}) => { // default resultSize = 100
  const url = `https://opensea.io/collection/${slug}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`;
  return await offersByScrollingByUrl(url, resultSize, optionsGiven);
}
const offersByScrollingByUrl = async (url, resultSize = 100, optionsGiven = {}) => {
  const beginTime = Date.now();
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
  customPuppeteerProvided && warnIfNotUsingStealth(browser);

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

  logs && console.log("extracting offers and stats from __wired__ variable");
  const currencyDict = _extractCurrencyDict(__wired__);
  const offersFromWired = _extractOffers(__wired__, currencyDict);
  const stats = _extractStats(__wired__);

  // IF MORE THAN 32 RESULTS NEEDED, SCROLL THROUGH PAGE
  let offersFromGraphql = [];
  let responses = [];
  let responseErrors = [];
  if (offersFromWired.length < resultSize) {
    // monitor all network activity, save all graphql api responses
    page.on('response', async (response) => {
      if (response._url.includes("graphql")) {
        responses.push(response);
        const offersBatch = await extractOffersFromGraphqlApiResponse(response, responseErrors);
        // console.log(offersBatch); // 🚧 for debugging
        offersFromGraphql = offersFromGraphql.concat(offersBatch);
      }
    });
    let bottomReached = await bottomOfPageReached(page);

    // AUTOSCROLL
    while(!bottomReached && offersFromGraphql.length < resultSize) {
      logs && console.log("autoscrolling...");
      await scrollToBottom(page);
      await page.waitForTimeout(5000);
      bottomReached = await bottomOfPageReached(page);
      console.log({bottomReached});
    }
    // const offersFromGraphqlPromises = responses.map(res => extractOffersFromGraphqlApiResponse(res, responseErrors));
    // offersFromGraphql = await Promise.all(offersFromGraphqlPromises);
    console.log({offersFromGraphql});
  }

  // close browser
  if (!customPuppeteerProvided && !debug) {
    logs && console.log("closing browser...");
    await browser.close();
  }

  const endTime = Date.now();
  const offers = offersFromWired.concat(offersFromGraphql).flat();
  // // remove duplicates
  // const uniqOffers = x.offers.filter((v,i,s) => s.map(o => o.offerUrl).indexOf(v.offerUrl) === i).length;
  return {
    offers: sort ? _sortOffersLowToHigh(offers, currencyDict) : offers,
    stats: stats,
    executionTime: Number((endTime - beginTime) / 1000), // measure performance in seconds
    responses: responses,
    responseErrors: responseErrors,
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
function _extractCurrencyDict(__wired__) {
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
  return currencyDict;
}

function _extractOffers(__wired__, currencyDict) {
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
  return offers;
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

const extractOffersFromGraphqlApiResponse = async (response, responseErrors) => {
  const buf = await response.buffer();
  const data = JSON.parse(buf.toString());
  try {
    return data.data.query.search.edges.map(o => {
      const assetContract = o.node.asset.assetContract.address;
      const tokenId = o.node.asset.tokenId;
      const contractAndTokenIdExist = Boolean(assetContract) && Boolean(tokenId);
      return {
        name: o.node.asset.name,
        tokenId: tokenId,
        displayImageUrl: o.node.asset.imageUrl,
        assetContract: assetContract,
        offerUrl: contractAndTokenIdExist ? `https://opensea.io/assets/${assetContract}/${tokenId}` : undefined,
        floorPrice: {
          amount: o.node.asset.orderData.bestAsk.paymentAssetQuantity.quantityInEth/1000000000000000000,
          currency: "ETH",
        }
      }
    })

  } catch(err) {
    responseErrors.push(response);
    return [];
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    await new Promise(async (resolve, reject) => {
      var distance = 100;
      var delay = 100;
      var totalHeight = 0;
      var timer = setInterval(async () => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  });
}

async function bottomOfPageReached(page) {
  return await page.evaluate(() => {
    const bottomNotReached = document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight;
    return !bottomNotReached;
  });
}
async function scrollToBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}

module.exports = {
  offersByScrolling,
  offersByScrollingByUrl
};
