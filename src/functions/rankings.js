// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Scrapes all collections from the Rankings page at https://opensea.io/rankings?sortBy=total_volume
 * nPages = how many pages should be scraped?
 *   (by default only scrape 1 page = 100 collections)
 * timeout = how long to wait for page content, in ms.
 *   (default 3 seconds = 3000 ms). Higher number makes algorithm slower,
 *   but might help when having a slower connection
 * logs = displays status report to console if true
 * mode = "headless" or "debug".
 */
const rankings = async (nPages = 1, mode = "headless") => {
  const logs = true;
  const headless = mode !== "debug";
  logs && console.log(`=== OpenseaScraper.rankings() ===\n...fetching ${nPages} pages (= top ${nPages*100} collections)`);
  const browser = await puppeteer.launch({
    headless: headless,
    args: ['--start-maximized'],
  });
  const page = await browser.newPage();
  const url = "https://opensea.io/rankings?sortBy=total_volume";
  logs && console.log("...opening url: " + url);
  await page.goto(url);

  logs && console.log("...🚧 waiting for cloudflare to resolve");
  await page.waitForSelector('.cf-browser-verification', {hidden: true});

  // EXPOSE ALL HELPER FUNCTIONS
  logs && console.log("...exposing helper functions through script tag")
  await page.addScriptTag({path: "./src/helpers/rankingsHelperFunctions.js"});

  // SCROLL TO BOTTOM AND FETCH COLLECTIONS
  logs && console.log("...scrolling to bottom and fetching collections.");
  let dict = await scrollToBottomAndFetchCollections(page);

  // scrape n pages
  for (let i = 0; i < nPages - 1; i++) {
    await clickNextPageButton(page);
    await page.waitForSelector('.Image--image');
    logs && console.log("...scrolling to bottom and fetching collections. Items fetched so far: " + Object.keys(dict).length);
    dict = await scrollToBottomAndFetchCollections(page);
  }
  await browser.close();
  // transform dict to array + remove invalid results
  const filtered = Object.values(dict).filter(o => o.rank !== 0 && o.name !== "");
  logs && console.log("...🥳 DONE. Total Collections fetched: " + Object.keys(dict).length);
  // order by rank
  return filtered.sort((a,b) => a.rank - b.rank);
}

module.exports = rankings;



/**
 * HELPER FUNCTIONS
 */
async function clickNextPageButton(page) {
  await page.click('[value=arrow_forward_ios]');
}
async function scrollToBottomAndFetchCollections(page) {
  return await page.evaluate(() => new Promise((resolve) => {
    // keep in mind inside the browser context we have the global variable "dict" initialized
    // defined inside src/helpers/rankingsHelperFunctions.js
    var scrollTop = -1;
    const interval = setInterval(() => {
      console.log("another scrol... dict.length = " + Object.keys(dict).length);
      window.scrollBy(0, 50);
      // fetchCollections is a function that is exposed through page.addScript() and
      // is defined inside src/helpers/rankingsHelperFunctions.js
      fetchCollections(dict);
      if(document.documentElement.scrollTop !== scrollTop) {
        scrollTop = document.documentElement.scrollTop;
        return;
      }
      clearInterval(interval);
      resolve(dict);
    }, 5);
  }));
}
