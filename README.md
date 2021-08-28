# Opensea Scraper

Scraping NFT floor prices from opensea, because the Opensea API returns inaccurate floor prices. With this utility you get the actual floor price, that is the lowest offer currently availible.
![inaccurate-floor-prices](https://user-images.githubusercontent.com/44790691/131232128-0601f7d4-a051-4e8e-9963-bd0ba0ea2852.png)

# Install

```bash
npm install opensea-scraper
```

# Usage
```js
const OpenseaScraper = require("opensea-scraper");

// which nft project to scrape?
const slug = "cool-cats-nft";

// get the lowest availible price on Opensea
const floorPrice = await OpenseaScraper.floorPrice(slug);

// get basic info (from the opensea API)
const basicInfo = await OpenseaScraper.basicInfo(slug);
```

`**slug**` is the human readable identifier that opensea uses to identify a collection. It can be extracted from the URL: https://opensea.io/collection/{slug}
![slug](https://user-images.githubusercontent.com/44790691/131232333-b79c50d7-606c-480a-9816-9d750ab798ff.png)

# Demo

```bash
npm run demo
```

# Contribute

Open PR or issue if you would like to have more features added.
