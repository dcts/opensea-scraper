const runBasic = require("./basic.js");
const runWithPuppeteer = require("./withPuppeteer.js")

async function run() {
  await runBasic();
  await runWithPuppeteer();
}

run();