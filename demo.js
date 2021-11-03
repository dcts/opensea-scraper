const OpenseaScraper = require("./src/index.js");

// which NFT project to scrape?
const slug = "cool-cats-nft";
const options = {
  debug: false,
  sort: true,
  logs: true,
  browserInstance: undefined,
}
console.log(`===>>> ${slug} <<<===`);
console.log("OPTIONS:");
console.log(options);


(async () => {
  // basic info
  console.log(`\n\n\n\n✅ === OpenseaScraper.basicInfo(slug) ===`);
  const basicInfo = await OpenseaScraper.basicInfo(slug);
  console.log(`basic info (taken from the opensea API):`);
  console.log(basicInfo);

  // get the current floor price
  console.log(`\n\n\n\n✅ === OpenseaScraper.floorPrice(slug) ===`);
  const floorPrice = await OpenseaScraper.floorPrice(slug);
  console.log(`...done! 🔥 \nfloor price:`);
  console.dir(floorPrice, {depth: null});

  // get floor price by url
  console.log(`\n\n\n\n✅ === OpenseaScraper.floorPriceByUrl(url) ===`);
  console.log("scraping floor price from custom url... (to fetch floor price for a SANDBOX LAND token)")
  const floorPriceByUrl = await OpenseaScraper.floorPriceByUrl("https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW");
  console.dir(floorPriceByUrl, {depth: null});

  // get offers
  console.log(`\n\n\n\n✅ === OpenseaScraper.offers(slug) ===`);
  const result = await OpenseaScraper.offers(slug, options);
  console.log(`total Offers: ${result.stats.totalOffers}`);
  console.log(`top 3 Offers`);
  console.dir(result.offers.slice(0,3), {depth: null});

  // get offersByUrl
  console.log(`\n\n\n\n✅ === OpenseaScraper.offersByUrl(url, resultSize) ===`);
  const url = "https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW";
  const resultByUrl = await OpenseaScraper.offersByUrl(url, options);
  console.log(`total Offers: ${resultByUrl.stats.totalOffers}`);
  console.log(`top 3 Offers`);
  console.dir(resultByUrl.offers.slice(0,3), {depth: null});

  // scrape rankings => https://opensea.io/rankings?sortBy=total_volume
  console.log(`\n\n\n\n✅ === OpenseaScraper.rankings() ===`);
  console.log("scraping 1 page of rankings => https://opensea.io/rankings?sortBy=total_volume");
  const rankings = await OpenseaScraper.rankings(options);
  console.log(`scraped ${rankings.length} collections: ${rankings.map(o => o.slug).join(" | ")}`);

  console.log("\n🎉 DEMO ENDED 🥳")
})();

