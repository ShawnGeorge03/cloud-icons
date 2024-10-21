import { createDir } from "../utils.js";
import { download, DOWNLOAD_DIR, extractSVG } from "./assets.js";
import { convertSVGtoJSX, exportBuildSummary, setupBuild } from "./build.js";
import { convertSVGtoReact } from "./code.js";
import loadSourcesConfig from "./config.js";
import optimizeSVG from "./svg.js";

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
await setupBuild();

console.log("Extracting Asset Packages...");
const filePaths = await extractSVG(downloads)
  .then((results) => {
    console.log("Successfully extracted all asset packages!!\n");
    return results;
  })
  .catch((error) => {
    console.log("Unable to extract all asset packages!!\n");
    console.error(error);
  });

console.log("Optimizing Asset Packages...");
await optimizeSVG(filePaths)
  .then(() => console.log("Successfully optimized all assets!!\n"))
  .catch((error) => {
    console.log("Unable to optimize assets!!\n");
    console.error(error);
  });

console.log("Converting SVG to JSX...");
await convertSVGtoJSX(filePaths)
  .then(() => console.log("Successfully converted all SVG to JSX!!\n"))
  .catch((error) => {
    console.log("Unable to convert all SVG to JSX!!\n");
    console.error(error);
  });

console.log("Converting SVG to React...");
await convertSVGtoReact(filePaths)
  .then(() => console.log("Successfully converted all SVG to React!!\n"))
  .catch((error) => {
    console.log("Unable to convert all SVG to React!!\n");
    console.error(error);
  });

console.log("Exporting Build Summary...");
await exportBuildSummary(Object.keys(sources), filePaths);
