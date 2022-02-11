const OpenseaScraper = require("./src/index.js");

// switch on/off which function to demo
const demoBasicInfo = true;
const demoOffers = true;
const demoOffersByUrl = true;
const demoRankings = true;
const demoOffersByScrolling = true;
const demoOffersByScrollingByUrl = true;

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
  if (demoBasicInfo) {
    console.log(`\n\n\n\n✅ === OpenseaScraper.basicInfo(slug) ===`);
    const basicInfo = await OpenseaScraper.basicInfo(slug);
    console.log(`basic info (taken from the opensea API):`);
    console.log(basicInfo);
  }

  // get offers
  if (demoOffers) {
    console.log(`\n\n\n\n✅ === OpenseaScraper.offers(slug) ===`);
    const result = await OpenseaScraper.offers(slug, options);
    console.log(`total Offers: ${result.stats.totalOffers}`);
    console.log(`top 3 Offers`);
    console.dir(result.offers.slice(0,3), {depth: null});
  }

  // get offersByUrl
  if (demoOffersByUrl) {
    // const urlSandbox = "https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW";
    console.log(`\n\n\n\n✅ === OpenseaScraper.offersByUrl(url, resultSize) ===`);
    const url = "https://opensea.io/collection/boredapeyachtclub?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Background&search[stringTraits][0][values][0]=Purple&search[stringTraits][1][name]=Earring&search[stringTraits][1][values][0]=Silver%20Hoop&search[stringTraits][2][name]=Eyes&search[stringTraits][2][values][0]=Bloodshot";
    const resultByUrl = await OpenseaScraper.offersByUrl(url, options);
    console.log(`total Offers: ${resultByUrl.stats.totalOffers}`);
    console.log(`top 3 Offers`);
    console.dir(resultByUrl.offers.slice(0,3), {depth: null});
  }

  // scrape rankings => https://opensea.io/rankings?sortBy=total_volume
  if (demoRankings) {
    console.log(`\n\n\n\n✅ === OpenseaScraper.rankings() ===`);
    console.log(`scraping ranking (last 24h)`);
    const rankings = await OpenseaScraper.rankings("24h", options);
    console.log(`scraped ${rankings.length} collections: ${rankings.map(o => o.slug).join(" | ")}`);
  }

  // get offersByScrolling
  if (demoOffersByScrolling) {
    console.log(`\n\n\n\n✅ === OpenseaScraper.offersByScrolling(slug, 40) ===`);
    const result = await OpenseaScraper.offersByScrolling(slug, 40, options);
    console.log(`total Offers: ${result.stats.totalOffers}`);
    console.log(`all scraped offers (max 40):`);
    console.dir(result.offers, {depth: null});
  }

  // get offersByScrollingByUrl
  if (demoOffersByScrollingByUrl) {
    console.log(`\n\n\n\n✅ === OpenseaScraper.offersByScrollingByUrl(url, 42) ===`);
    const urlByScrolling = "https://opensea.io/collection/boredapeyachtclub?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Clothes&search[stringTraits][0][values][0]=Black%20Suit";
    const resultByScrolling = await OpenseaScraper.offersByScrollingByUrl(urlByScrolling, 42, options);
    console.log(`total Offers: ${resultByScrolling.stats.totalOffers}`);
    console.log(`all scraped offers (max 42):`);
    console.dir(resultByScrolling.offers, {depth: null});
  }

  console.log("\n🎉 DEMO ENDED 🥳")
})();

