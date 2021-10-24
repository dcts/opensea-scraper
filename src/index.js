const basicInfo = require("./functions/basicInfo.js");
const floorPrice = require("./functions/floorPrice.js");
const floorPriceByUrl = require("./functions/floorPriceByUrl.js");
const rankings = require("./functions/rankings.js");

const OpenseaScraper = {
  basicInfo,
  floorPrice,
  floorPriceByUrl,
  rankings,
};

module.exports = OpenseaScraper;

