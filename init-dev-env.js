const OpenseaScraper = require("./src/index.js");
const CloudflareScraper = require('cloudflare-scraper');

const slug = "cool-cats-nft";
const options = {
  debug: true,
  sort: true,
  logs: true,
  browserInstance: undefined,
}
console.log(`===>>> ${slug} <<<===`);
console.log("OPTIONS:");
console.log(options);
console.log("\n\n");
