const basicInfo = require("./functions/basicInfo.js");
const { offers, offersByUrl } = require("./functions/offers.js");
const rankings = require("./functions/rankings.js");

const OpenseaScraper = {
  basicInfo,
  offers,
  offersByUrl,
  rankings,
};

module.exports = OpenseaScraper;

