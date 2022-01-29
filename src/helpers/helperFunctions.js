exports.isUsingStealthPlugin = (browserInstance) => {
  if (!browserInstance.plugins) {
    return false;
  }
  const pluginsUsed = browserInstance.plugins.map(p => p.constructor.name);
  return pluginsUsed.includes("StealthPlugin");
}
