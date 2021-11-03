# Opensea Scraper

🎉 **UPDATE 2021-Nov-3**: Opensea officially [updated their API](https://twitter.com/apiopensea/status/1455918328397144069). You can get accurate realtime floor prices from this endpoint: `https://api.opensea.io/api/v1/collection/{slug}/stats`:
```js
const axios = require("axios");

async function getFloorPrice(slug) {
  try {
    const url = `https://api.opensea.io/collection/${slug}/stats`;
    const response = await axios.get(url);
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
  browserInstance: undefined,
}

// get basic info (from the opensea API)
const basicInfo = await OpenseaScraper.basicInfo(slug);

// get offers from opensea. Each offer includes the floor price, tokenName,
// tokenId, tokenContractAddress and offerUrl
let result = await OpenseaScraper.offers(slug, options);
console.dir(result, {depth: null}); // result object contains keys `stats` and `offers`

// get offers from opensea using a custom link
// Opensea supports encoding filtering in the URL so this method is helpful for getting
// a specific asset (for example floor price for a LAND token from the sandbox collection)
const url = "https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW";
result = await OpenseaScraper.offersByUrl(url, options);
console.dir(result, {depth: null}); // result object contains keys `stats` and `offers`

// scrape all slugs, names and ranks from the top collections from the rankings page
// sorted by all time volume => https://opensea.io/rankings?sortBy=total_volume
// `nbrOfPages` specifies how many pages should be scraped (1 page = 100 collections)
const nbrOfPages = 2;
const ranking = await OpenseaScraper.rankings(nbrOfPages, options);
```

### Debugging

To investigate an issue turn on logs and debug mode (`debug: true` and `logs: true`):
```js
const result = await OpenseaScraper.offers("treeverse", {
  debug: true,
  logs: true
});
```

### Bring your own puppeteer

if you want to customize the settings for your puppeteer instance you can add your own puppeteer browser instance in the options:
```js
const puppeteer = require("puppeteer");
const myPuppeteerInstance = await puppeteer.launch(myCustomSettings);

const result = await OpenseaScraper.offer("cool-cats-nft", {
  browserInstance: myPuppeteerInstance
});
```

## Demo

```bash
npm run demo
```

## Contribute

Open PR or issue if you would like to have more features added.
