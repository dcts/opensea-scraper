// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const { executablePath } = require("puppeteer");
const puppeteer = require("puppeteer-extra");
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// load helper function to detect stealth plugin
const {
  warnIfNotUsingStealth,
  sleep,
} = require("../helpers/helperFunctions.js");

/**
 * Scrapes all collections from the Rankings page at https://opensea.io/rankings
 * options = {
 *   nbrOfPages: number of pages that should be scraped? (defaults to 1 Page = top 100 collections)
 *   debug: [true,false] enable debugging by launching chrome locally (omit headless mode)
 *   logs: [true,false] show logs in the console
 *   browserInstance: browser instance created with puppeteer.launch() (bring your own puppeteer instance)
 * }
 */
const rankings = async (
  type = "total",
  chain = undefined,
  optionsGiven = {}
) => {
  const optionsDefault = {
    debug: false,
    logs: false,
    additionalWait: 0, // waittime in milliseconds, after page loaded, but before stating to scrape
    browserInstance: undefined,
  };
  const options = { ...optionsDefault, ...optionsGiven };
  const { debug, logs, additionalWait, browserInstance } = options;
  const customPuppeteerProvided = Boolean(optionsGiven.browserInstance);
  logs && console.log(`=== OpenseaScraper.rankings() ===\n`);

  // init browser
  let browser = browserInstance;
  if (!customPuppeteerProvided) {
    browser = await puppeteer.launch({
      headless: !debug, // when debug is true => headless should be false
      args: ["--start-maximized"],
      executablePath: executablePath(),
    });
  }
  customPuppeteerProvided && warnIfNotUsingStealth(browser);

  const page = await browser.newPage();
  const url = getUrl(type, chain);
  logs && console.log("...opening url: " + url);
  await page.goto(url);

  logs && console.log("...🚧 waiting for cloudflare to resolve");
  await page.waitForSelector(".cf-browser-verification", { hidden: true });

  // additional wait?
  if (additionalWait > 0) {
    logs &&
      console.log(
        `...additional wait active, waiting ${additionalWait / 1000} seconds...`
      );
    await sleep(additionalWait);
  }

  logs && console.log("...extracting __NEXT_DATA variable");
  const __NEXT_DATA__ = await page.evaluate(() => {
    const nextDataStr = document.getElementById("__NEXT_DATA__").innerText;
    return JSON.parse(nextDataStr);
  });

  // extract relevant info
  const top100 = _parseNextDataVarible(__NEXT_DATA__);
  logs && console.log(`🥳 DONE. Total ${top100.length} Collections fetched: `);
  return top100;
};

function _parseNextDataVarible(__NEXT_DATA__) {
  const extractFloorPrice = (windowCollectionStats, extractionMethod) => {
    try {
      if (extractionMethod === "multichain") {
        return {
          amount: Number(windowCollectionStats.floorPrice.unit),
          currency: windowCollectionStats.floorPrice.symbol.toUpperCase(),
        };
      }
      return {
        amount: Number(windowCollectionStats.floorPrice.eth),
        currency: "ETH",
      };
    } catch (err) {
      return null;
    }
  };
  const extractCollection = (node) => {
    return {
      name: node.name,
      slug: node.slug,
      logo: node.logo,
      isVerified: node.isVerified,
      floorPrice: extractFloorPrice(node.windowCollectionStats),
      floorPriceMultichain: extractFloorPrice(
        node.windowCollectionStats,
        "multichain"
      ),
      // statsV2: node.statsV2, // 🚧 comment back in if you need additional stats
      // windowCollectionStats: node.windowCollectionStats, // 🚧 comment back in if you need additional stats
    };
  };
  return __NEXT_DATA__.props.relayCache[0][1].json.data.rankings.edges.map(
    (obj) => extractCollection(obj.node)
  );
}

function getUrl(type, chain) {
  chainExtraQueryParameter = chain ? `&chain=${chain}` : "";
  if (type === "24h") {
    return `https://opensea.io/rankings?sortBy=one_day_volume${chainExtraQueryParameter}`;
  } else if (type === "7d") {
    return `https://opensea.io/rankings?sortBy=seven_day_volume${chainExtraQueryParameter}`;
  } else if (type === "30d") {
    return `https://opensea.io/rankings?sortBy=thirty_day_volume${chainExtraQueryParameter}`;
  } else if (type === "total") {
    return `https://opensea.io/rankings?sortBy=total_volume${chainExtraQueryParameter}`;
  }

  throw new Error(
    `Invalid type provided. Expected: 24h,7d,30d,total. Got: ${type}`
  );
}
module.exports = rankings;
