import fs from "fs/promises";
import Fuse from "fuse.js";
import path from "path";
import process from "process";
import svgToJsx from "svg-to-jsx";

import { createDir, deleteDir, doesPathExist } from "../utils.js";
import { JSX_DIR, SVG_DIR } from "./assets.js";

export const WWW_DATA_DIR = path.join(
  path.dirname(process.cwd()),
  "www",
  "src",
  "data"
);

/**
 * Setup the build with the required directories
 *
 * @returns {Promise<void>}
 */
export async function setupBuild() {
  const directories = [JSX_DIR, SVG_DIR, WWW_DATA_DIR];

  await Promise.all(
    directories.map(async (directory) => {
      await deleteDir(directory);
      await createDir(directory);
    })
  )
    .then(() => console.log("Successfully setup directories!!\n"))
    .catch((error) => {
      console.log("Unable to setup directories!!\n");
      console.error(error);
    });
}

/**
 * Converts the SVG file to JSX
 *
 * @param {Array<string>} filePaths - The paths of all the svg files
 *
 * @returns {Promise<void>}
 */
export async function convertSVGtoJSX(filePaths) {
  for (const filePath of filePaths) {
    if (await doesPathExist(filePath)) {
      const svgContent = await fs.readFile(filePath, {
        encoding: "utf8",
      });

      const jsxCode = await svgToJsx(svgContent);

      await fs.writeFile(filePath.replaceAll("svg", "jsx"), jsxCode, {
        encoding: "utf-8",
      });
    }
  }
}

/**
 * Exports Search Index and Data
 *
 * @param {Array<string>} sources The names of the providers (eg. AWS, Azure, GCP)
 * @param {Array<string>} filePaths All the files by providers used during build
 *
 * @returns {Promise<void>}
 */
export async function exportBuildSummary(sources, filePaths) {
  const data = {
    sources,
    items: [],
  };

  // Some filenames do not include the common short forms for CSPs
  // Ex. amazon-simple-storage-service
  const tagRules = [
    { source: "amazon", target: "aws" },
    { source: "microsoft", target: "azure" },
    { source: "google", target: "gcp" },
  ];

  for (const filePath of filePaths) {
    const filename = path.basename(filePath, ".svg");
    let tags = [...new Set(filename.split("-"))];

    for (const rule of tagRules)
      if (tags.includes(rule.source)) tags.unshift(rule.target);

    data.items.push({ filename, tags });
  }

  const index = Fuse.createIndex(["filename", "tags"], data.items);

  await fs
    .writeFile(
      path.join(WWW_DATA_DIR, "index.json"),
      JSON.stringify(index, null, 2),
      (error) => {
        if (error) {
          console.log("An error has occurred ", error);
          return;
        }
      }
    )
    .then(() => console.log("Successfully exported search index!!"))
    .catch((error) => {
      console.log("Unable to export search index!!");
      console.error(error);
    });

  await fs
    .writeFile(
      path.join(WWW_DATA_DIR, "icons.json"),
      JSON.stringify(data, null, 2),
      (error) => {
        if (error) {
          console.log("An error has occurred ", error);
          return;
        }
      }
    )
    .then(() => console.log("Successfully exported data!!\n"))
    .catch((error) => {
      console.log("Unable to export data!!\n");
      console.error(error);
    });
}
