import process from "process";
import { Browser, Builder, By } from "selenium-webdriver";

import chrome from "selenium-webdriver/chrome.js";
import edge from "selenium-webdriver/edge.js";
import firefox from "selenium-webdriver/firefox.js";

/** @import { Action } from "./config.js" */

/**
 * Creates a new WebDriver instance for the specified browser.
 *
 * @returns {Promise<WebDriver>} A promise that resolves to the created WebDriver instance.
 */
async function createDriver() {
  try {
    const firefoxOptions = new firefox.Options();
    firefoxOptions.addArguments("--headless");
    return new Builder()
      .forBrowser(Browser.FIREFOX)
      .setFirefoxOptions(firefoxOptions)
      .build();
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "Error" &&
      error.message.includes("Unable to obtain browser driver")
    ) {
      console.error("Unable to locate FireFox Browser");
      console.log("Attempting to use Default Browser");

      switch (process.platform) {
        case "win32": {
          const edgeOptions = new edge.Options();
          edgeOptions.addArguments("--headless");
          return new Builder()
            .forBrowser(Browser.EDGE)
            .setEdgeOptions(edgeOptions)
            .build();
        }
        case "darwin":
          return new Builder().forBrowser(Browser.SAFARI).build();
        default: {
          const chromeOptions = new chrome.Options();
          chromeOptions.addArguments("--headless");
          return new Builder()
            .forBrowser(Browser.CHROME)
            .setChromeOptions(chromeOptions)
            .build();
        }
      }
    }

    throw error;
  }
}

/**
 * @typedef {Object} ScraperResult
 * @property {string} site The providers site name
 * @property {string} url The asset url that contains the icons
 */

/**
 * Scrapes the specified site for the link to the asset package.
 *
 * @param {string} site The providers site name
 * @param {string} url The provider site that contains the asset url
 * @param {Array<Action>} actions Steps to scrape the asset url from the page
 *
 * @returns {Promise<ScraperResult>} A promise that resolves to an object containing the site and the link to the asset package.
 */
export default async function scrape(site, url, actions) {
  const driver = await createDriver();
  console.log("Scrapping Asset Link from " + site);

  try {
    await driver.get(url);
    for (const action of actions) {
      switch (action.type) {
        case "click":
          await driver.findElement(By.css(action.locator)).click();
          break;
        case "attribute":
          return {
            site,
            url: await driver
              .findElement(By.linkText(action.locator))
              .getAttribute("href"),
          };
        default:
          throw new Error("Invalid scrape action");
      }
    }
  } finally {
    await driver.quit();
  }
}
