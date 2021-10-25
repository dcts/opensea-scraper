const basicInfo = require("./functions/basicInfo.js");
const floorPrice = require("./functions/floorPrice.js");
const floorPriceByUrl = require("./functions/floorPriceByUrl.js");
const rankings = require("./functions/rankings.js");
const offers = require("./functions/offers.js");
const offersByUrl = require("./functions/offersByUrl.js");


const OpenseaScraper = {
  basicInfo,
  floorPrice,
  floorPriceByUrl,
  rankings,
  offers,
  offersByUrl,
};

module.exports = OpenseaScraper;

