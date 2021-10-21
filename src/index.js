const floorPrice = require("./functions/floorPrice.js");
const floorPriceByUrl = require("./functions/floorPriceByUrl.js");
const offers = require("./functions/offers.js");
const basicInfo = require("./functions/basicInfo.js");

const OpenseaScraper = {
  basicInfo,
  floorPrice,
  floorPriceByUrl,
  offers,
};

module.exports = OpenseaScraper;

