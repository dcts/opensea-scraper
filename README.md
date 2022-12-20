# Opensea Scraper

**DISCLAIMER**: You can get accurate realtime floor prices from this official opensea API endpoint: `https://api.opensea.io/api/v1/collection/{slug}/stats`:

```js
const axios = require("axios");

async function getFloorPrice(slug) {
  try {
    const url = `https://api.opensea.io/collection/${slug}/stats`;
    const response = await axios.get(url, {
      headers: { "Accept-Encoding": "gzip,deflate,compress" },
    });
    return response.data.stats.floor_price;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

await getFloorPrice("lostpoets");
await getFloorPrice("treeverse");
await getFloorPrice("cool-cats-nft");
```

If you need floor prices, please use the official API (see above 👆👆👆). This scraper still can be used to scrape additional information about offers (tokenId, name, tokenContractAddress and offerUrl) as well as the ranking.

## Install

```bash
npm install opensea-scraper
```

## Usage

ℹ **`slug`** is the human readable identifier that opensea uses to identify a collection. It can be extracted from the URL: https://opensea.io/collection/{slug}
![slug](https://user-images.githubusercontent.com/44790691/131232333-b79c50d7-606c-480a-9816-9d750ab798ff.png)

ℹ **`options`** is an object with the following keys

- **`debug`** [Boolean] launches chromium locally, omits headless mode (default: `false`)
- **`logs`** [Boolean]: display logs in the console (default: `false`)
- **`sort`** [Boolean]: sorts the offers by lowest to highest (default: `true`)
- **`additionalWait`** [Number]: time to wait (in milliseconds) after page was loaded before the scraping starts (default: `0`)
- **`browserInstance`** [PuppeteerBrowser]: bring your own browser instance for more control

```js
const OpenseaScraper = require("opensea-scraper");

// which nft project to scrape?
const slug = "cool-cats-nft";

// options
const options = {
  debug: false,
  logs: false,
  sort: true,
  additionalWait: 0,
  browserInstance: undefined,
};

// get basic info (from the opensea API)
const basicInfo = await OpenseaScraper.basicInfo(slug);

// get offers from opensea. Each offer includes the
// floor price, tokenName, tokenId, tokenContractAddress
// and offerUrl
// scrapes only the first 20 offers from opensea.
let result = await OpenseaScraper.offers(slug, options);
console.dir(result, { depth: null }); // result object contains keys `stats` and `offers`

// get offers from opensea using a custom link
// Opensea supports encoding filtering in the URL so
// this method is helpful for getting a specific asset
// (for example floor price for a deadfellaz with
// a purple fur trait)
let url =
  "https://opensea.io/collection/deadfellaz?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Body&search[stringTraits][0][values][0]=Purple%20Fur&search[toggles][0]=BUY_NOW";
result = await OpenseaScraper.offersByUrl(url, options);
// result object contains keys `stats` and `offers`
console.dir(result, { depth: null });

// DISCLAIMER: FUNCTION `offersByScrolling`
// IS CURRENTLY NOT WORKING (!!!) see [issue#36](https://github.com/dcts/opensea-scraper/issues/36)
// get offersByScrolling from opensea. This is an
// alternative method to get the same data as with
// the function `offers`, with the only difference
// that the data is here scraped actively by scrolling
// through the page. This method is not as efficient
// as the `offers` method, but it can scrape more
// than 20 offers. You could even scrape a whole
// collection with ~10k spots (this is not recommended
// though).
// IMPORTANT: if you need less than 20 offers,
// please use the function `offers()` instead
let resultSize = 40;
result = await OpenseaScraper.offersByScrolling(slug, resultSize, options);
// result object contains keys `stats` and `offers`
console.dir(result, { depth: null });

// DISCLAIMER: FUNCTION `offersByScrollingByUrl`
// IS CURRENTLY NOT WORKING (!!!) see [issue#36](https://github.com/dcts/opensea-scraper/issues/36)
// get offersByScrollingByUrl from opensea using a
// custom link instead of the slug. the same logic
// applies as in `offersByScrolling()`
// Opensea supports encoding filtering in the URL so
// this method is helpful for getting a specific asset
// (for example floor price for a deadfellaz with
// a purple fur trait)
// IMPORTANT: if you need less than 20 offers,
// please use the function `offersByUrl()` instead
url =
  "https://opensea.io/collection/deadfellaz?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Body&search[stringTraits][0][values][0]=Purple%20Fur&search[toggles][0]=BUY_NOW";
resultSize = 40;
result = await OpenseaScraper.offersByScrollingByUrl(url, resultSize, options);
// result object contains keys `stats` and `offers`
console.dir(result, { depth: null });

// scrape all slugs, names and ranks from the top collections from the rankings page
// "type" is one of the following:
//   "24h": ranking of last 24 hours: https://opensea.io/rankings?sortBy=one_day_volume
//   "7d": ranking of last 7 days: https://opensea.io/rankings?sortBy=seven_day_volume
//   "30d": ranking of last 30 days: https://opensea.io/rankings?sortBy=thirty_day_volume
//   "total": scrapes all time ranking: https://opensea.io/rankings?sortBy=total_volume
// "chain" is one of the following: "ethereum", "matic", "klaytn", "solana"
//    if chain is unset, all chains will be selected by default
const type = "24h"; // possible values: "24h", "7d", "30d", "total"
const chain = "solana";
const ranking = await OpenseaScraper.rankings(type, chain, options);
```

### Debugging

To investigate an issue turn on logs and debug mode (`debug: true` and `logs: true`):

```js
const result = await OpenseaScraper.offers("treeverse", {
  debug: true,
  logs: true,
});
```

### Bring your own puppeteer

if you want to customize the settings for your puppeteer instance you can add your own puppeteer browser instance in the options. **🚧 IMPORTANT**: I recommend using stealth plugin as otherwise you most likely won't be able to scrape opensea. If you find a way without using the stealth plugin please report in the form of an issue!

```js
const puppeteer = require("puppeteer-extra");
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const myPuppeteerInstance = await puppeteer.launch(myCustomSettings);

const result = await OpenseaScraper.offer("cool-cats-nft", {
  browserInstance: myPuppeteerInstance,
});
```

## Demo

```bash
npm run demo
```

## Run local console / REPL

To test the functions in an REPL node environment that has `OpenseaScraper` service preloaded simply run:

```bash
node --experimental-repl-await -i -e "$(< init-dev-env.js)"
```

I recommend saving an alias:

```bash
alias consl='node --experimental-repl-await -i -e "$(< init-dev-env.js)"';
```

## Contribute

Open PR or issue if you would like to have more features added.

## Donations 🙏

```
Thanks for your support!
BTC: bc1qq5qn96ahlqjxfxz2n9l20kem8p9nsz5yzz93f7
ETH: 0x3e4503720Fb8f4559Ecf64BE792b3100722dE940
```

# nftfloorprice.info 🔔

Simple NFT floor price alerts. Easily track all your NFTs and receive realtime email alerts with: https://nftfloorprice.info<br><br>
<a href="https://nftfloorprice.info"><img src="https://user-images.githubusercontent.com/44790691/140594412-b70d93d1-2278-4d27-abf9-74466bee0137.png"></a>
