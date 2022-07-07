// INIT PUPPETEER (no stealth for testing)
const puppy = require('puppeteer');

// INIT PUPPETEER (with stealth)
const puppyWithStealth = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppyWithStealth.use(StealthPlugin());

// load services
const OpenseaScraper = require("./src/index.js");
const { isUsingStealthPlugin, warnIfNotUsingStealth, sleep } = require("./src/helpers/helperFunctions.js");

// example data
const slug = "cool-cats-nft";
const options = {
  debug: false,
  sort: true,
  logs: true,
  additionalWait: 0,
  browserInstance: undefined,
};

// GREET DEVELOPER
console.log("\n\n");
console.log(fs.readFileSync('init-dev-env-message.txt', 'utf8'));
console.log("\n\n");

(async () => {
  browser = await puppy.launch();
  browserWithStealth = await puppyWithStealth.launch();
})();
