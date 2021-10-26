// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Scrapes the actual floor price from the opensea website by URL instead of slug
 * this is usefull e.g. if you want to know the floor price for a SANDBOX LAND parcel
 * (because LAND and game assets are listed under the same "sandbox" collection, but
 * game assets are way cheaper than LAND)
 *
 * mode is either "headless" (default) or "debug"
 * => run in debug mode to show browser interaction (no headless mode)
 *    and avoid closing browser when the function ends
 */
const floorPriceByUrl = async (url, opts = {}) => {
  const { browser: providedBrowser, mode = "headless" } = opts;
  let browser = providedBrowser;
  if (!browser) {
    browser = await puppeteer.launch({
      headless: mode === "debug" ? false : true,
      args: ['--start-maximized'],
    });
  }
  const page = await browser.newPage();
  await page.goto(url);

  // ...🚧 waiting for cloudflare to resolve
  await page.waitForSelector('.cf-browser-verification', {hidden: true});

  const floorPrice = await page.evaluate(() => {
    const cardsNodeList = document.querySelectorAll(".Asset--anchor .AssetCardFooter--price-amount");
    const cardsArray = Array.prototype.slice.call(cardsNodeList); // you cannot use .map on a nodeList, we need to transform it to an array
    const floorPrices = cardsArray.map(card => {
      try {
        // only fetch price in ETH
        if (!card.querySelector(".Price--eth-icon")) {
          return undefined;
        }
        const priceStr = card.querySelector(".Price--amount").textContent;
        return Number(priceStr.split(",").join("."));
      } catch(err) {
        return undefined;
      }
    }).filter(val => val); // filter out invalid (undefined) values
    // if no ETH price is found, return undefined
    if (floorPrices.length === 0) {
      return undefined;
    }
    // sometimes the order of elements is not accurate on Opensea,
    // thats why we need to minimize get the lowest value
    // IMPORTANT: spread operator is needed for Math.min() to work with arrays
    const floorPrice = Math.min(...floorPrices);
    return {
      amount: floorPrice,
      currency: "ETH",
    }
  });

  if (!providedBrowser) {
    await browser.close();
  }
  return floorPrice;
}

module.exports = floorPriceByUrl;
