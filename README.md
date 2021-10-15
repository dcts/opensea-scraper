# Opensea Scraper

⚠ **Problem**: NFT floor prices returned by the Opensea API are not accurate (they lag at least 2 hours, sometimes even a full day it seems). Here is an example of cool-cats floor price actually being 8.5, but the API returns 9.4: 
![opensea-inaccuracy](https://user-images.githubusercontent.com/44790691/137519280-a765c8ef-d35f-4ef6-b5f1-04c31915b37a.png)

With this utility you can scrape the correct NFT floor prices directly from opensea by using puppeteer.

## Install

```bash
npm install opensea-scraper
```

## Usage
```js
const OpenseaScraper = require("opensea-scraper");

// which nft project to scrape?
const slug = "cool-cats-nft";

// scrape the correct floor price of an actual offer that exists on opensea
const floorPrice = await OpenseaScraper.floorPrice(slug);

// get basic info (from the opensea API)
const basicInfo = await OpenseaScraper.basicInfo(slug);
```

`**slug**` is the human readable identifier that opensea uses to identify a collection. It can be extracted from the URL: https://opensea.io/collection/{slug}
![slug](https://user-images.githubusercontent.com/44790691/131232333-b79c50d7-606c-480a-9816-9d750ab798ff.png)

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
  } catch(err) {
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
