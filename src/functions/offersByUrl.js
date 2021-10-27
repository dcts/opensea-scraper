// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * scrapes opensea offers by URL instad of slug.
 * Offers hold additional information, not only the floor price,
 * example offer object:
 * {
 *   floorPrice: {
 *     amount: 1.2,
 *     currency: "ETH"
 *   },
 *   name: "cool cat #231",
 *   tokenId: 234
 * }
 */
const offersByUrl = async (url, resultSize = 10, mode = "headless") => {
  const browser = await puppeteer.launch({
    headless: mode === "debug" ? false : true,
    args: ['--start-maximized'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  // ...🚧 waiting for cloudflare to resolve
  await page.waitForSelector('.cf-browser-verification', {hidden: true});

  // expose all helper functions
  await page.addScriptTag({path: require.resolve("../helpers/offersHelperFunctions.js")});

  // scrape offers until target resultsize reached or bottom of page reached
  const { offers, stats } = await scrollAndFetchOffers(page, resultSize);
  if (mode !== "debug") {
    await browser.close();
  }
  const offersSorted = offers.sort((a,b) => a.floorPrice.amount - b.floorPrice.amount)
  return { offers: offersSorted.slice(0, resultSize), stats };
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
      const totalOffersCount = getTotalOffersCount();

      const endOfPageReached = document.documentElement.scrollTop === currentScrollTop;
      const enoughItemsFetched = Object.keys(dict).length >= resultSize;

      if(!endOfPageReached && !enoughItemsFetched) {
        currentScrollTop = document.documentElement.scrollTop;
        return;
      }
      clearInterval(interval);
      resolve({ offers: Object.values(dict), stats: { totalOffersCount }});
    }, 120);
  }), resultSize);
}


module.exports = offersByUrl;
