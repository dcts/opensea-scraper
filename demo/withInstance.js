const OpenseaScraper = require("../src/index.js");

// which NFT project to scrape?
const slug = "cool-cats-nft";
console.log(`===>>> ${slug} <<<===`);

(async function run() {
  const osScraperInstance = await OpenseaScraper.getInstanceWithPuppeteer();

  // get the current floor price
  console.log(`\n\n\n\n✅ === osScraperInstance.floorPrice(slug) ===`);
  const floorPrice = await osScraperInstance.floorPrice(slug);
  console.log(`...done! 🔥 \nfloor price:`);
  console.log(floorPrice);

  // get floor price by url
  console.log(`\n\n\n\n✅ === osScraperInstance.floorPriceByUrl(url) ===`);
  console.log("scraping floor price from custom url... (to fetch floor price for a SANDBOX LAND token)")
  const floorPriceByUrl = await osScraperInstance.floorPriceByUrl("https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW");
  console.log(floorPriceByUrl);

  // get offers
  console.log(`\n\n\n\n✅ === osScraperInstance.offers(slug, resultSize) ===`);
  let resultSize = 3;
  const offers = await osScraperInstance.offers(slug, resultSize);
  console.log(`scraped ${offers.length} offers: ${offers.map(o => `${o.name} : ${o.floorPrice.amount} ${o.floorPrice.currency}`).join(" | ")}`);

  // get offersByUrl
  console.log(`\n\n\n\n✅ === osScraperInstance.offersByUrl(url, resultSize) ===`);
  resultSize = 3;
  const url = "https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW";
  const offersByUrl = await osScraperInstance.offersByUrl(url, resultSize);
  console.log(`scraped ${offersByUrl.length} offers: ${offersByUrl.map(o => `${o.tokenName} : ${o.floorPrice.amount} ${o.floorPrice.currency}`).join(" | ")}`);

  // scrape rankings => https://opensea.io/rankings?sortBy=total_volume
  console.log(`\n\n\n\n✅ === osScraperInstance.rankings(nPages) ===`);
  console.log("scraping 1 page of rankings => https://opensea.io/rankings?sortBy=total_volume");
  const rankings = await osScraperInstance.rankings(1);
  console.log(`scraped ${rankings.length} collections: ${rankings.map(o => o.slug).join("|")}`);

  await osScraperInstance.close();
  console.log("\n🎉 DEMO ENDED 🥳");
})();

