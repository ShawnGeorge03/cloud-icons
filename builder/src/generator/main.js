import { createDir } from "../utils.js";
import {
  convertSVGtoJSX,
  download,
  DOWNLOAD_DIR,
  extractSVG,
  optimizeSVG,
  setupBuild,
} from "./assets.js";
import loadSourcesConfig from "./config.js";

createDir(DOWNLOAD_DIR);

const sources = await loadSourcesConfig();

console.log("Downloading Asset Packages...");
const downloads = await Promise.all(
  Object.entries(sources).map((source) => download(...source))
)
  .then((results) => {
    console.log("Successfully downloaded all asset packages!!\n");
    return results;
  })
  .catch((error) => {
    console.log("Unable to download all asset packages!!\n");
    console.error(error);
  });

console.log("Setup Packages Directory...");
await setupBuild(Object.keys(sources));

console.log("Extracting Asset Packages...");
const assets = await Promise.all(
  downloads.map(async ({ site, filePath }) => {
    return { site, filePaths: await extractSVG(filePath) };
  })
)
  .then((results) => {
    console.log("Successfully extracted all asset packages!!\n");
    return results;
  })
  .catch((error) => {
    console.log("Unable to extract all asset packages!!\n");
    console.error(error);
  });

console.log("Optimizing Asset Packages...");
await Promise.all(
  assets.map(async ({ filePaths }) => {
    await optimizeSVG(filePaths);
  })
)
  .then(() => console.log("Successfully optimized all assets!!\n"))
  .catch((error) => {
    console.log("Unable to optimize assets!!\n");
    console.error(error);
  });

console.log("Converting SVGs to JSX...");
await Promise.all(
  assets.map(async ({ filePaths }) => {
    await convertSVGtoJSX(filePaths);
  })
)
  .then(() => console.log("Successfully converted all SVG to JSX!!\n"))
  .catch((error) => {
    console.log("Unable to convert all SVG to JSX!!\n");
    console.error(error);
  });
