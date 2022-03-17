/**
 * === HELPER FUNCTIONS FOR : OpenseaScraper.offersByScrolling() ===
 * These are all functions that need to be exposed inside
 * puppeteers page.evaluate() function (inside the chromium instance)
 * additionally to the functions we also need a global variable
 * "dict" that holds a dictionary of all scraped offers
 *
 * To make it more readable we outsource this to a seperate file,
 * then load the file via puppeteers page.addScriptTag() function
 */

// initialize dict global variable inside puppeteer chromium instance
// to save all scraped data
const dict = {};

// fetches offers that are currently visible on the page
// and save them to the passed dictionary, with the slug being the key.
// When a collection is already in the dict it will be overwritten.
function fetchOffers(dict) {
  const cardsNodeList = document.querySelectorAll(".Asset--anchor");
  const cardsArray = Array.prototype.slice.call(cardsNodeList);
  cardsArray.forEach(card => {
    const floorPrice = _extractFloorPrice(card);
    const name = _extractName(card);
    const tokenId = _extractTokenId(card);
    const offerUrl = _extractOfferUrl(card);
    const displayImageUrl = _extractDisplayImageUrl(card);
    if (floorPrice && name) {
      const uniqIdentifier = `${name}_${tokenId || "unknownTokenId"}`;
      dict[uniqIdentifier] = {
        name: name,
        tokenId: tokenId,
        floorPrice: floorPrice,
        displayImageUrl: displayImageUrl,
        offerUrl: offerUrl,
      }
    }
  });
}
function _extractName(card) {
  try {
    return card.querySelector(".AssetCardFooter--name").innerText;
  } catch (err) {

  }
}
function _extractTokenId(card) {
  try {
    const href = card.getAttribute("href") || "";
    const tokenId = href.split("/").slice(-1).pop();
    return tokenId === "" ? undefined : Number(tokenId); // catch case where tokenId is empty string
  } catch(err) {
    return undefined;
  }
}
function _extractOfferUrl(card) {
  try {
    const href = card.getAttribute("href");
    return href ? `https://opensea.io${href}` : undefined;
  } catch(err) {
    return undefined;
  }
}
function _extractDisplayImageUrl(card) {
  try {
    return card.querySelector("img").src;
  } catch(err) {
    return undefined;
  }
}
function _extractFloorPrice(card) {
  try {
    const priceSection = card.querySelector(".AssetCardFooter--price-amount");
    const currencyIsEth = Boolean(priceSection.querySelector(".Price--eth-icon"));
    const floorPriceStr = priceSection.querySelectorAll(":scope > div")[1].textContent.split(",").join("."); // replace comma with dot
    const floorPrice = Number(floorPriceStr);
    return {
      amount: floorPrice,
      currency: currencyIsEth ? "ETH" : "unknown",
    }
  } catch(err) {
    return undefined;
  }
}
