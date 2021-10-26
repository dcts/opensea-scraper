const basicInfo = require("./functions/basicInfo.js");
const floorPrice = require("./functions/floorPrice.js");
const floorPriceByUrl = require("./functions/floorPriceByUrl.js");
const rankings = require("./functions/rankings.js");
const offers = require("./functions/offers.js");
const offersByUrl = require("./functions/offersByUrl.js");
const getInstanceWithPuppeteer = require("./functions/getInstanceWithPuppeteer.js");

module.exports = {
  basicInfo,
  floorPrice,
  floorPriceByUrl,
  rankings,
  offers,
  offersByUrl,
  getInstanceWithPuppeteer
};

