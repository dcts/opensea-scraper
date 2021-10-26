// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 *
 */
// const offers = async (slug, resultSize, mode = "headless") => {
const offers = async (slug, resultSize = 10, opts = {}) => {
  const { browser: providedBrowser, mode = "headless" } = opts;
  let browser = providedBrowser;
  if (!browser) {
    browser = await puppeteer.launch({
      headless: mode === "debug" ? false : true,
      args: ['--start-maximized'],
    });
  }
  const page = await browser.newPage();
  await page.goto(`https://opensea.io/collection/${slug}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`);

  // ...🚧 waiting for cloudflare to resolve
  await page.waitForSelector('.cf-browser-verification', {hidden: true});

  // EXPOSE ALL HELPER FUNCTIONS
  await page.addScriptTag({path: "./src/helpers/offersHelperFunctions.js"});

  // scrape offers until target resultsize reached or bottom of page reached
  const offers = await scrollAndFetchOffers(page, resultSize);
  if (!providedBrowser) {
    await browser.close();
  }
  const offersSorted = offers.sort((a,b) => a.floorPrice.amount - b.floorPrice.amount)
  return offersSorted.slice(0, resultSize);
}


async function scrollAndFetchOffers(page, resultSize) {
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


module.exports = offers;
