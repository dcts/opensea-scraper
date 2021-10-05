const OpenseaScraper = require("./src/OpenseaScraper.js");

// which NFT project to scrape?
const slug = "sandbox";
console.log(`=== ${slug} ===`);

(async () => {
  // basic info
  const basicInfo = await OpenseaScraper.basicInfo(slug);
  console.log(`basic info (taken from the opensea API):`);
  console.log(basicInfo);

  // get the current floor price
  console.log("scraping floor price...")
  const floorPrice = await OpenseaScraper.floorPrice(slug, "debug");
  console.log(`...done! 🔥 \nfloor price = ${floorPrice} ETH`);

  console.log("\nDEMO ENDED 🥳")
})();

