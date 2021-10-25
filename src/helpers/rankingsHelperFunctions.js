/**
 * === HELPER FUNCTIONS FOR : OpenseaScraper.rankings() ===
 * These are all functions that need to be exposed inside
 * puppeteers page.evaluate() function (inside the chromium instance)
 * additionally to the functions we also need a global variable
 * "dict" that holds a dictionary of all scraped collections
 *
 * To make it more readable we outsource this to a seperate file,
 * then load the file via puppeteers page.addScriptTag() function
 */

// initialize dict global variable inside puppeteer chromium instance
// to save all scraped data
const dict = {};

// fetches collections that are currently visible on the page
// and save them to the passed dictionary, with the slug being the key.
// When a collection is already in the dict it will be overwritten.
function fetchCollections(dict) {
  const rowsNodeList = document.querySelectorAll('[role=list] > div > a');
  const rows = Array.prototype.slice.call(rowsNodeList);
  rows.forEach(row => {
    const slug = _extractSlug(row);
    if (slug) { // if slug exists, override dict
      dict[slug] = {
        slug: slug,
        rank: _extractRank(row),
        thumbnail: _extractThumbnail(row),
        name: _extractName(row),
        floorPrice: _extractFloorPrice(row),
      };
    }
  })
}
function _extractRank(row) {
  try {
    // return Number(row.querySelector("div > div").innerText);
    return Number(row.innerText.split(/\D/)[0]);
  } catch(err) {
    return undefined;
  }
}
function _extractSlug(row) {
  try {
    const collectionUrlSplit = row.href.split("/");
    const slug = collectionUrlSplit[collectionUrlSplit.length - 1];
    return slug;

  } catch(err) {
    return undefined;
  }
}
function _extractThumbnail(row) {
  try {
    return row.querySelector(".Image--image").src;
  } catch(err) {
    return undefined;
  }
}
function _extractName(row) {
  try {
    return row.querySelector(".Ranking--collection-name-overflow").innerText;
  } catch(err) {
    return undefined;
  }
}
// NOT WORKING SOMEHOW
function _extractFloorPrice(row) { // only ETH floor prices, otherwise uzndefined
  try {
    const isEth = row.querySelector(".RankingsPricereact__EthAvatar-sc-rjdias-0").src === "https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg";
    if (!isEth) {
      return undefined;
    }
    return Number(el.querySelectorAll(".Overflowreact__OverflowContainer-sc-10mm0lu-0.fqMVjm")[5].innerText);

  } catch(err) {
    return undefined;
  }
}
