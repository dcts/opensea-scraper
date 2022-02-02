exports.isUsingStealthPlugin = (browserInstance) => {
  return (browserInstance._process?.spawnargs || []).includes("--disable-blink-features=AutomationControlled");
}
