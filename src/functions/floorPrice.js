const { offersByUrl } = require("./offers.js");
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Gets the floor price of a given collection from opensea.
 * uses `OpenseaScraper.offers()` under the hood.
 * `slug` is the collection identifier by opensea
 */
const floorPrice = async (slug) => {
  const url = `https://opensea.io/collection/${slug}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`;
  return await floorPriceByUrl(url);
}

/**
 * use custom url to scrape the floor price
 * Opensea supports encoding filtering in the URL so this method is helpful for getting
 * a specific asset (for example floor price for a LAND token from the sandbox collection)
 */
const floorPriceByUrl = async (url) => {
  const result = await offersByUrl(url, {sort: true});
  return result.offers[0].floorPrice;
}

module.exports = {
  floorPrice,
  floorPriceByUrl
}
