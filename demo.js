const OpenseaScraper = require("./src/index.js");

// which NFT project to scrape?
const slug = "cool-cats-nft";
console.log(`===>>> ${slug} <<<===`);

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
  console.log(`\n\n\n\n✅ === OpenseaScraper.offers(slug, resultSize) ===`);
  let resultSize = 3;
  const offers = await OpenseaScraper.offers(slug, resultSize);
  console.log(`scraped ${offers.length} offers:`);
  console.dir(offers, {depth: null});

  // get offersByUrl
  console.log(`\n\n\n\n✅ === OpenseaScraper.offersByUrl(url, resultSize) ===`);
  resultSize = 3;
  const url = "https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW";
  const offersByUrl = await OpenseaScraper.offersByUrl(url, resultSize);
  console.log(`scraped ${offersByUrl.length} offers:`);
  console.dir(offersByUrl, {depth: null});

  // scrape rankings => https://opensea.io/rankings?sortBy=total_volume
  console.log(`\n\n\n\n✅ === OpenseaScraper.rankings(nPages) ===`);
  console.log("scraping 1 page of rankings => https://opensea.io/rankings?sortBy=total_volume");
  const rankings = await OpenseaScraper.rankings(1);
  console.log(`scraped ${rankings.length} collections: ${rankings.map(o => o.slug).join(" | ")}`);

  console.log("\n🎉 DEMO ENDED 🥳")
})();

