const OpenseaScraper = require("./src/index.js");

// which NFT project to scrape?
const slug = "cool-cats-nft";
console.log(`===>>> ${slug} <<<===`);

(async () => {
  // basic info
  console.log(`\n\n\n\n✅ === OpenseaScraper.basicInfo() ===`);
  const basicInfo = await OpenseaScraper.basicInfo(slug);
  console.log(`basic info (taken from the opensea API):`);
  console.log(basicInfo);

  // get the current floor price
  console.log(`\n\n\n\n✅ === OpenseaScraper.floorPrice(slug) ===`);
  const floorPrice = await OpenseaScraper.floorPrice(slug);
  console.log(`...done! 🔥 \nfloor price:`);
  console.log(floorPrice);

  // get floor price by url
  console.log(`\n\n\n\n✅ === OpenseaScraper.floorPriceByUrl(url) ===`);
  console.log("scraping floor price from custom url... (to fetch floor price for a SANDBOX LAND token)")
  const floorPriceByUrl = await OpenseaScraper.floorPriceByUrl("https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW");
  console.log(floorPriceByUrl);

  // get offers
  console.log(`\n\n\n\n✅ === OpenseaScraper.offers(slug, resultSize) ===`);
  const resultSize = 3;
  const offers = await OpenseaScraper.offers(slug, resultSize);
  console.log(`scraped ${offers.length} offers: ${offers.map(o => `${o.name} : ${o.floorPrice.amount} ${o.floorPrice.currency}`).join(" | ")}`);

  // scrape rankings => https://opensea.io/rankings?sortBy=total_volume
  console.log(`\n\n\n\n✅ === OpenseaScraper.rankings(nPages) ===`);
  console.log("scraping 1 page of rankings => https://opensea.io/rankings?sortBy=total_volume");
  const rankings = await OpenseaScraper.rankings(1);
  console.log(`scraped ${rankings.length} collections: ${rankings.map(o => o.slug).join("|")}`);

  console.log("\n🎉 DEMO ENDED 🥳")
})();

