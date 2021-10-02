# ⚠ Important Note
⚠ Opensea updated their API to now finally also return accurate and real-time floor prices! 🎉🥳 So we do not need any scraping of floor prices anymore! Here is a short code snipped on how to get floor prices for each nft project listed on opensea:
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

See below the old repository👇👇👇
# Opensea Scraper
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

## Contribute

Open PR or issue if you would like to have more features added.
