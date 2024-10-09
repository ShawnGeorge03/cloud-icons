import fs from "fs/promises";
import path from "path";
import process from "process";
import svgToJsx from "svg-to-jsx";
import { optimize } from "svgo";

import {
  createDir,
  deleteDir,
  doesPathExist,
  loadPackageJson,
} from "../utils.js";
import { JSX_DIR, SVG_DIR } from "./assets.js";

/**
 * Setup the build directory with the required directories
 *
 * @param {Array<string> } sites The provider site names
 *
 * @returns {Promise<void>}
 */
export async function setupBuild(sites) {
  const directories = [];

  sites.forEach((site) => {
    directories.push(path.join(JSX_DIR, site));
    directories.push(path.join(SVG_DIR, site));
  });

  await Promise.all(
    directories.map(async (directory) => {
      await deleteDir(directory);
      await createDir(directory);
    })
  )
    .then(() => console.log("Successfully setup packages directory!!\n"))
    .catch((error) => {
      console.log("Unable to setup packages directory!!\n");
      console.error(error);
    });
}

/**
 * Optimizes the SVG file
 *
 * @param {Array<string>} filePaths - The paths of all the svg files
 *
 * @returns {Promise<void>}
 */
export async function optimizeSVG(filePaths) {
  for (const filePath of filePaths) {
    if (await doesPathExist(filePath)) {
      const svgContent = await fs.readFile(filePath, {
        encoding: "utf8",
      });

      const optimizedSVG = optimize(svgContent, {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
          "convertStyleToAttrs",
          "prefixIds",
          "removeDimensions",
        ],
      });

      await fs.writeFile(filePath, optimizedSVG.data, {
        encoding: "utf-8",
      });
    }
  }
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
 * @typedef {Object} Assets
 * @property {string} site - The name of the provider (eg. AWS, Azure, GCP)
 * @property {Array<string>} filePaths - Array of filePaths to `.svg` files
 */

/**
 * Generates a Build Summary
 *
 * @param {Assets} assets All the files by providers used during build
 *
 * @returns {Promise<void>}
 */
export async function exportBuildSummary(assets) {
  const config = {
    sources: {},
    items: [],
  };

  const { name, version } = await loadPackageJson(path.dirname(process.cwd()));

  assets.map(({ site, filePaths }) => {
    config.sources[site] = site.toLowerCase();
    filePaths.map((filePath) => {
      const filename = path.basename(filePath, ".svg");
      const tags = new Set(filename.split("-").sort());
      config.items.push({
        filename,
        tags: [config.sources[site], ...tags],
        links: `${name}@${version}/svg/${site}/${filename}`,
      });
    });
  });

  await fs
    .writeFile(
      path.join(path.dirname(process.cwd()), "www", "config.json"),
      JSON.stringify(config, null, 2),
      (error) => {
        if (error) {
          console.log("An error has occurred ", error);
          return;
        }
      }
    )
    .then(() => console.log("Successfully exported build summary!!\n"))
    .catch((error) => {
      console.log("Unable to export build summary!!\n");
      console.error(error);
    });
}
