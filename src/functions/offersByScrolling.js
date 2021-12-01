// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * scrapes opensea offers for a given collection by scrolling
 * through the page and fetching all offers "manually".
 * if you need less than 32 offers, please use the regular `offers()`
 * method, since it is significantly more efficient.
 *
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
const offersByScrolling = async (slug, resultSize, optionsGiven = {}) => {
  const url = `https://opensea.io/collection/${slug}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`;
  return await offersByScrollingByUrl(url, resultSize, optionsGiven);
}

/**
 * use custom url to scrape offers
 * Opensea supports encoding filtering in the URL so this method is helpful for getting
 * a specific asset (for example floor price for a LAND token from the sandbox collection)
 */
const offersByScrollingByUrl = async (url, resultSize, optionsGiven = {}) => {
  if (!resultSize) {
    throw new Error(`Invalid 'resultSize', please provide a number. Got: ${resultSize}`);
  }
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
  await page.goto(url);

  // ...🚧 waiting for cloudflare to resolve
  logs && console.log("🚧 waiting for cloudflare to resolve");
  await page.waitForSelector('.cf-browser-verification', {hidden: true});

  // expose all helper functions
  logs && console.log("expose all helper functions");
  await page.addScriptTag({path: require.resolve("../helpers/offersByScrollingHelperFunctions.js")});

  // scrape offers until target resultsize reached or bottom of page reached
  logs && console.log("scrape offers until target resultsize reached or bottom of page reached");
  let [offers, totalOffers] = await Promise.all([
    _scrollAndFetchOffers(page, resultSize),
    _extractTotalOffers(page),
  ]);

  if (!customPuppeteerProvided && !debug) {
    logs && console.log("closing browser...");
    await browser.close();
  }

  if (sort) {
    offers = offers.sort((a,b) => a.floorPrice.amount - b.floorPrice.amount);
  }
  return {
    offers: offers.slice(0, resultSize),
    stats: {
      totalOffers: totalOffers,
    }
  };
}


async function _scrollAndFetchOffers(page, resultSize) {
  return await page.evaluate((resultSize) => new Promise((resolve) => {
    // keep in mind inside the browser context we have the global variable "dict" initialized
    // defined inside src/helpers/rankingsHelperFunctions.js
    let currentScrollTop = -1;
    const interval = setInterval(() => {
      console.log("another scrol... dict.length = " + Object.keys(dict).length);
      window.scrollBy(0, 50);
      // fetchOffers is a function that is exposed through page.addScript() and
      // is defined inside src/helpers/offersHelperFunctions.js
      fetchOffers(dict);

      const endOfPageReached = document.documentElement.scrollTop === currentScrollTop;
      const enoughItemsFetched = Object.keys(dict).length >= resultSize;

      if(!endOfPageReached && !enoughItemsFetched) {
        currentScrollTop = document.documentElement.scrollTop;
        return;
      }
      clearInterval(interval);
      resolve(Object.values(dict));
    }, 120);
  }), resultSize);
}

async function _extractTotalOffers(page) {
  try {
    // set timeout to 1 sec, no need to extensively wait since page should be loaded already
    const element = await page.waitForSelector('.AssetSearchView--results-count', {timeout: 1000});
    const resultsText = await element.evaluate(el => el.textContent); // grab the textContent from the element, by evaluating this function in the browser context
    const dotsRemoved = resultsText.replace(/\./g,'');
    return Number(dotsRemoved.split(" ")[0]);
  } catch (err) {
    return undefined;
  }
}


module.exports = {
  offersByScrolling,
  offersByScrollingByUrl
};
