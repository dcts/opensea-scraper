const axios = require("axios");

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

class OpenseaScraper {
  /**
   * Scrapes the actual floor price from the opensea website
   * => uses puppeteer stealth plugin
   * => set mode to "debug" to avoid headless mode
   */
  static async floorPrice(slug, mode = "headless") {
    // puppeteer usage as normal
    const browser = await puppeteer.launch({
      headless: mode === "debug" ? false : true,
      args: ['--start-maximized'],
    });
    const page = await browser.newPage();
    page.on('console', consoleMessageObject => function (consoleMessageObject) {
      if (consoleMessageObject._type !== 'warning') {
        console.debug(consoleMessageObject._text)
      }
    });
    await page.goto(`https://opensea.io/collection/${slug}?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW`);
    await page.waitForTimeout(5);

    const floorPrice = await page.evaluate(() => {
      const cardsNodeList = document.querySelectorAll(".Asset--anchor .AssetCardFooter--price-amount");
      const cardsArray = Array.prototype.slice.call(cardsNodeList); // you cannot use .map on a nodeList, we need to transform it to an array
      const floorPrices = cardsArray.map(card => {
        try {
          // only fetch price in ETH
          if (!card.querySelector(".Price--eth-icon")) {
            return undefined;
          }
          const priceStr = card.querySelector(".Price--amount").textContent;
          return Number(priceStr.split(",").join("."));
        } catch(err) {
          return undefined;
        }
      }).filter(val => val); // filter out invalid (undefined) values
      // if no ETH price is found, return undefined
      if (floorPrices.length === 0) {
        return undefined;
      }
      // sometimes the order of elements is not accurate on Opensea,
      // thats why we need to minimize get the lowest value
      // IMPORTANT: spread operator is needed for Math.min() to work with arrays
      return Math.min(...floorPrices);
    });

    if (mode !== "debug") {
      await browser.close();
    }
    return floorPrice;
  }

  /**
   * Gets basic info from the opensea API
   * just a wrapper
   */
  static async basicInfo(slug) {
    const response = await axios.get(`https://api.opensea.io/collection/${slug}`);
    const collectionObj = response.data.collection;
    return {
      slug: slug,
      name: _getName(collectionObj),
      symbol: _getSymbol(collectionObj),
      floorPrice: _getFloorPrice(collectionObj),
      description: _getDescription(collectionObj),
      contractAddress: _getContractAddress(collectionObj),
      safelistRequestStatus: _getSafelistRequestStatus(collectionObj),
      isVerified: _isVerified(collectionObj),
      bannerImageUrl: _getBannerImageUrl(collectionObj),
      imageUrl: _getImageUrl(collectionObj),
      social: {
        discord: _getDiscord(collectionObj),
        medium: _getMedium(collectionObj),
        twitter: _getTwitter(collectionObj),
        website: _getWebsite(collectionObj),
        telegram: _getTelegram(collectionObj),
        instagram: _getInstagram(collectionObj),
        wiki: _getWiki(collectionObj),
      },
      createdAt: new Date(),
    };
  }
}
// HELPER FUNCTIONS FOR ScrapeOpensea.basicInfo()
function _getName(collectionObj) {
  try {
    return collectionObj.name;
  } catch(err) {
    return null;
  }
}
function _getContractAddress(collectionObj) {
  try {
    return collectionObj.primary_asset_contracts[0].address;
  } catch(err) {
    return null;
  }
}
function _getFloorPrice(collectionObj) {
  try {
    return collectionObj.stats.floor_price;
  } catch(err) {
    return null;
  }
}
function _getBannerImageUrl(collectionObj) {
  try {
    return collectionObj.banner_image_url;
  } catch(err) {
    return null;
  }
}
function _getImageUrl(collectionObj) {
  try {
    return collectionObj.image_url;
  } catch(err) {
    return null;
  }
}
function _getDiscord(collectionObj) {
  try {
    return collectionObj.discord_url;
  } catch(err) {
    return null;
  }
}
function _getMedium(collectionObj) {
  try {
    return collectionObj.medium_username;
  } catch(err) {
    return null;
  }
}
function _getTwitter(collectionObj) {
  try {
    return collectionObj.twitter_username;
  } catch(err) {
    return null;
  }
}
function _getWebsite(collectionObj) {
  try {
    return collectionObj.external_url;
  } catch(err) {
    return null;
  }
}
function _getTelegram(collectionObj) {
  try {
    return collectionObj.telegram_url;
  } catch(err) {
    return null;
  }
}
function _getInstagram(collectionObj) {
  try {
    return collectionObj.instagram_username;
  } catch(err) {
    return null;
  }
}
function _getWiki(collectionObj) {
  try {
    return collectionObj.wiki_url;
  } catch(err) {
    return null;
  }
}
function _getDescription(collectionObj) {
  try {
    return collectionObj.description;
  } catch(err) {
    return null;
  }
}
function _getSymbol(collectionObj) {
  try {
    return collectionObj.primary_asset_contracts[0].symbol;
  } catch(err) {
    return null;
  }
}
function _getSafelistRequestStatus(collectionObj) {
  try {
    return collectionObj.safelist_request_status;
  } catch (error) {
    return null;
  }
}
function _isVerified(collectionObj) {
  try {
    const safelistRequestStatus = _getSafelistRequestStatus(collectionObj);
    return safelistRequestStatus === "verified";

  } catch (error) {
    return null;
  }
}
module.exports = OpenseaScraper;
