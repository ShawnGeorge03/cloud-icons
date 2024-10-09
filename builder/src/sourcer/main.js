import { createSourcesConfig } from "../generator/config.js";
import loadProvidersConfig from "./config.js";
import scrape from "./scraper.js";

const config = await loadProvidersConfig();

console.log("Scraping Asset Links...");

await Promise.all(
  config.map(({ site, url, actions }) => scrape(site, url, actions))
)
  .then(
    async (results) =>
      await createSourcesConfig(
        results.reduce((result, obj) => {
          result[obj.site] = obj.url;
          return result;
        }, {})
      )
  )
  .then(() => console.log("Successfully located all links!!\n"))
  .catch((error) => {
    console.log("Unable to located all links!!\n");
    console.error(error);
  });
