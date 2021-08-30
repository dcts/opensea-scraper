const axios = require("axios");

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

class ScrapeOpensea {
  /**
   * Scrapes the actual floor price from the opensea website
   * => uses puppeteer stealth plugin
   */
  static async floorPrice(slug) {
    // puppeteer usage as normal
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://opensea.io/collection/${slug}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`);
    await page.waitForTimeout(5);

    const floorPrice = await page.evaluate(() => {
      const cardsNodeList = document.querySelectorAll(".Asset--anchor");
      const cardsArray = Array.prototype.slice.call(cardsNodeList); // you cannot use .map on a nodeList, we need to transform it to an array
      const floorPrices = cardsArray.map(card => {
        try {
          const priceStr = card.querySelector(".Price--amount").textContent;
          return Number(priceStr.split(",").join("."));
        } catch(err) {
          return undefined;
        }
      }).filter(val => val); // filter out invalid (undefined) values
      return Math.min(...floorPrices); // sometimes the order of elements is not accurate on Opensea, thats why we need to get the lowest value
    });
    await browser.close();
    return floorPrice;
  }

  /**
   * Gets basic info from the opensea API
   */
  static async basicInfo(slug) {
    const response = await axios.get(`https://api.opensea.io/collection/${slug}`);
    return {
      slug: slug,
      name: getName(response.data),
      contractAddress: getContractAddress(response.data),
      bannerImageUrl: getBannerImageUrl(response.data),
      imageUrl: getImageUrl(response.data),
      social: {
        discord: getDiscord(response.data),
        medium: getMedium(response.data),
        twitter: getTwitter(response.data),
        website: getWebsite(response.data),
      },
      createdAt: new Date(),
    };
  }
}
function getName(data) {
  try {
    return data.collection.name;
  } catch(err) {
    return null;
  }
}
function getContractAddress(data) {
  try {
    return data.collection.primary_asset_contracts[0].address;
  } catch(err) {
    return null;
  }
}
function getBannerImageUrl(data) {
  try {
    return data.collection.banner_image_url;
  } catch(err) {
    return null;
  }
}
function getImageUrl(data) {
  try {
    return data.collection.image_url;
  } catch(err) {
    return null;
  }
}
function getDiscord(data) {
  try {
    return data.collection.discord_url;
  } catch(err) {
    return null;
  }
}
function getMedium(data) {
  try {
    return data.collection.medium_username;
  } catch(err) {
    return null;
  }
}
function getTwitter(data) {
  try {
    return data.collection.twitter_username;
  } catch(err) {
    return null;
  }
}
function getWebsite(data) {
  try {
    return data.collection.external_url;
  } catch(err) {
    return null;
  }
}
module.exports = ScrapeOpensea;
