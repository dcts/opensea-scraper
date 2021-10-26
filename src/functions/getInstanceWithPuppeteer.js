const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const basicInfo = require("./basicInfo.js");
const floorPrice = require("./floorPrice.js");
const floorPriceByUrl = require("./floorPriceByUrl.js");
const rankings = require("./rankings.js");
const offers = require("./offers.js");
const offersByUrl = require("./offersByUrl.js");

async function OpenseaScraperInstance({ mode } = {}) {
  const browser = await puppeteer.launch({
    headless: mode === "debug" ? false : true,
    args: ['--start-maximized'],
  });

  return {
    close: () => browser.close(),
    basicInfo: (...params) => basicInfo(...params), // no browser here, as it's an api call
    floorPrice: (...params) => floorPrice(...params, { ...(params && params.opts ? params.opts : {}), browser}),
    floorPriceByUrl: (...params) => floorPriceByUrl(...params, { ...(params && params.opts ? params.opts : {}), browser}),
    rankings: (...params) => rankings(...params, { ...(params && params.opts ? params.opts : {}), browser}),
    offers: (...params) => offers(...params, { ...(params && params.opts ? params.opts : {}), browser}),
    offersByUrl: (...params) => offersByUrl(...params, { ...(params && params.opts ? params.opts : {}), browser}),
  }
}

module.exports = OpenseaScraperInstance