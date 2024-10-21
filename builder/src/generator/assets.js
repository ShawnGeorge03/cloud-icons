/* eslint-disable no-useless-escape */
import AdmZip from "adm-zip";
import fs from "fs";
import https from "https";
import path from "path";
import process from "process";

import { doesPathExist } from "../utils.js";
import generateFilename from "./file.js";

export const DOWNLOAD_DIR = path.join(process.cwd(), "downloads");
export const SVG_DIR = path.join(path.dirname(process.cwd()), "svg");
export const JSX_DIR = path.join(path.dirname(process.cwd()), "jsx");

/**
 * Downloads a zip file from a URL and saves it to /downloads
 *
 * @param {string} filename - The name to save the zip file as
 * @param {string} url - The URL of the zip file to download
 *
 * @returns {Promise<string>} - A promise that resolves to the path of the downloaded file
 */
export async function download(filename, url) {
  const filePath = path.join(DOWNLOAD_DIR, filename + ".zip");

  if (await doesPathExist(filePath)) return filePath;

  console.log("Downloading Asset Package from : " + filename);

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          const contentType = response.headers["content-type"];
          if (
            contentType &&
            (contentType.includes("application/zip") ||
              contentType.includes("application/octet-stream"))
          ) {
            const writeStream = fs.createWriteStream(filePath);

            response.pipe(writeStream);

            writeStream.on("finish", () => {
              writeStream.close();
              resolve(filePath);
            });

            writeStream.on("error", (err) => {
              console.error("Error writing file:", err);
              reject(err);
            });
          } else {
            reject(
              new Error("The URL does not point to a zip file", {
                cause: contentType,
              })
            );
          }
        } else if (response.statusCode === 404) {
          reject(
            new Error("File not found!", {
              cause: `Status code: ${response.statusCode}`,
            })
          );
        } else {
          reject(
            new Error("HTTP error!", {
              cause: `Status code: ${response.statusCode}`,
            })
          );
        }
      })
      .on("error", (err) => {
        console.error("Error downloading file:", err);
        reject(err);
      });
  });
}

/**
 * Extracts a zip file.
 *
 * @param {Array<string>} filePaths - The paths of all the zip files to extract
 *
 * @returns {Promise<Array<string>} - A promise that resolves to the path of the extracted files
 */
export async function extractSVG(filePaths) {
  const outputPaths = new Set();

  for (const filePath of filePaths) {
    if (!filePath.endsWith(".zip"))
      throw new Error("File must end with .zip", { cause: filePath });

    if (!(await doesPathExist(filePath)))
      throw new Error("File does not exist", { cause: filePath });

    try {
      const site = path.basename(filePath, ".zip");
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        const fileFilterRule =
          site === "AWS"
            ? entry.entryName.match(
                /Architecture-Group-Icons_[\d]+[\\\/][\w-]+.svg/
              ) ||
              entry.entryName.match(
                /Architecture-Service-Icons_[\d]+[\\\/][\w-]+[\\\/]32[\\\/][\w-]+.svg/
              ) ||
              entry.entryName.match(
                /Category-Icons_[\d]+[\\\/]Arch-Category_32[\\\/][\w-]+.svg/
              ) ||
              entry.entryName.match(
                /Resource-Icons_[\d]+[\\\/][\w-]+[\\\/][\w-]+.svg/
              )
            : entry.entryName.endsWith(".svg");

        if (fileFilterRule) {
          const filename = generateFilename(site, entry.entryName);

          // Ensures the filename is unique among all filenames
          let outputPath = path.join(SVG_DIR, filename);
          let count = 0;
          while (outputPaths.has(outputPath)) {
            count += 1;
            outputPath = path.join(
              SVG_DIR,
              `${path.parse(filename).name}-alternate-${count}.svg`
            );
          }

          const fileContent = zip.readAsText(entry.entryName);
          await fs.promises.writeFile(outputPath, fileContent);
          outputPaths.add(outputPath);
        }
      }
      console.log(`Successfully processed ${filePath}`);
    } catch (error) {
      console.error(`Failed to process ${filePath}:`, error);
    }
  }

  return Array.from(outputPaths).sort((a, b) => a.localeCompare(b));
}
