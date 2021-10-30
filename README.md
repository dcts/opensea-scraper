# Opensea Scraper

⚠ **Problem**: NFT floor prices returned by the Opensea API are not accurate (they lag at least 2 hours, sometimes even a full day it seems). Here is an example of cool-cats floor price actually being 8.5, but the API returns 9.4:
![opensea-inaccuracy](https://user-images.githubusercontent.com/44790691/137519280-a765c8ef-d35f-4ef6-b5f1-04c31915b37a.png)

With this utility you can scrape the correct NFT floor prices directly from opensea by using puppeteer.

## Install

```bash
npm install opensea-scraper
```

## Usage

ℹ `**slug**` is the human readable identifier that opensea uses to identify a collection. It can be extracted from the URL: https://opensea.io/collection/{slug}
![slug](https://user-images.githubusercontent.com/44790691/131232333-b79c50d7-606c-480a-9816-9d750ab798ff.png)

```js
const OpenseaScraper = require("opensea-scraper");

// which nft project to scrape?
const slug = "cool-cats-nft";

// get basic info (from the opensea API)
const basicInfo = await OpenseaScraper.basicInfo(slug);

// scrape the correct floor price from opensea
const floorPrice = await OpenseaScraper.floorPrice(slug);

// scrape the correct floor price from opensea by inserting a custom link
// this is usefull for example if you need the floor price for a sandbox LAND
// token, because the sandbox collection holds both assets and land, with assets
// traditionally being a lot cheaper
const floorPriceByUrl = await OpenseaScraper.floorPriceByUrl(
  "https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW"
);

// get offers from opensea. Each offer holds not only the floor price but also the tokenId.
// the resultSize is the number of offers you want to fetch.
const resultSize = 10;
const offers = await OpenseaScraper.offers(slug, resultSize);

// get offers from opensea using a custom link. Each offer holds not only the floor price but also the tokenId.
// the resultSize is the number of offers you want to fetch.
const resultSize = 10;
const url =
  "https://opensea.io/collection/sandbox?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Type&search[stringTraits][0][values][0]=Land&search[toggles][0]=BUY_NOW";
const offers = await OpenseaScraper.offersByUrl(url, resultSize);

// scrape all slugs, names and ranks from the top collections from the rankings page sorted by all time volume:
// => https://opensea.io/rankings?sortBy=total_volume
const pagesToScrape = 5; // 100 results per page. 5 pages = 200 results...
const ranking = await OpenseaScraper.rankings(pagesToScrape);
```

## Debugging

If you want to debug, you can pass `"debug"` as last argument and puppeteer will not run in headless mode, so the browser will be launched and you can watch the scraper run. Debugging mode is enabled for the following functions:

- floorPrice
- floorPriceByUrl
- offers
- offersByUrl
- rankings

```js
// Example how to use debug mode
await OpenseaScraper.offers("treeverse", 20, "debug");
```

## Demo

```bash
npm run demo
```

## Script to fetch Floor Price from API

**⚠ Important Note**: floor prices fetched with this method are not accurate (not in real time).

```js
const axios = require("axios");

async function getFloorPrice(slug) {
  try {
    const url = `https://api.opensea.io/collection/${slug}`;
    const response = await axios.get(url);
    return response.data.collection.stats.floor_price;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

const result = await getFloorPrice("lostpoets");
const result = await getFloorPrice("treeverse");
const result = await getFloorPrice("cool-cats-nft");
```

## Contribute

Open PR or issue if you would like to have more features added.

# Python Alternative

ℹ if you want a solution to scrape floor prices without using puppeteer, take a look at this python solution: https://gist.github.com/dcts/a1b689b88e61fe350a446a5799209c9b
