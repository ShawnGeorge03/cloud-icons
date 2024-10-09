/* eslint-disable no-useless-escape */
import fs from "fs";
import https from "https";
import path from "path";
import process from "process";
import yauzl from "yauzl";

import { doesPathExist } from "../utils.js";

export const DOWNLOAD_DIR = path.join(process.cwd(), "downloads");
export const SVG_DIR = path.join(path.dirname(process.cwd()), "svg");
export const JSX_DIR = path.join(path.dirname(process.cwd()), "jsx");

/**
 * @typedef {Object} DownloadResult
 * @property {string} site The providers site name
 * @property {string} filePath Path to the asset package
 */

/**
 * Downloads a zip file from a URL and saves it to /downloads
 *
 * @param {string} filename - The name to save the zip file as
 * @param {string} url - The URL of the zip file to download
 *
 * @returns {Promise<DownloadResult>} - A promise that resolves to the path of the downloaded file
 */
export async function download(filename, url) {
  const filePath = path.join(DOWNLOAD_DIR, filename + ".zip");

  if (await doesPathExist(filePath))
    return {
      site: filename,
      filePath,
    };

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
              resolve({
                site: filename,
                filePath,
              });
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
 * @param {string} filePath - The path of the zip file to extract
 *
 * @returns {Promise<Array<string>} - A promise that resolves to the path of the extracted files
 */
export async function extractSVG(filePath) {
  if (!filePath.endsWith(".zip"))
    throw new Error("File must end with .zip", { cause: filePath });

  if (!(await doesPathExist(filePath)))
    throw new Error("File does not exist", { cause: filePath });

  const site = path.basename(filePath, ".zip");
  const outputDir = path.join(SVG_DIR, site);
  const outputPaths = new Set();

  const generateFilename = (site, filename) => {
    let uniqueFilename = path.basename(filename, ".svg");

    switch (site) {
      case "AWS":
        uniqueFilename = uniqueFilename.replace(
          /^Arch_|_48|32|Arch-Category_|Res_|-|_|&| /g,
          " "
        );
        break;
      case "Azure":
        uniqueFilename = uniqueFilename
          .replace(/\d+-icon-service|_|-|\(|\)/g, " ")
          .replace(/\+/g, "plus");
        break;
      case "GCP":
        uniqueFilename = uniqueFilename.split(/_|-/g).join(" ");
        break;
      default:
        throw new Error("Invalid Site", { cause: site });
    }

    return uniqueFilename.trim().split(/\s+/).join("-").toLowerCase() + ".svg";
  };

  return new Promise((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.on("entry", (entry) => {
        const fileFilterRule =
          site === "AWS"
            ? !entry.fileName.includes("__MACOSX") &&
              (entry.fileName.match(
                /Architecture-Group-Icons_[\d]+[\\\/][\w-]+.svg/
              ) ||
                entry.fileName.match(
                  /Architecture-Service-Icons_[\d]+[\\\/][\w-]+[\\\/]32[\\\/][\w-]+.svg/
                ) ||
                entry.fileName.match(
                  /Category-Icons_[\d]+[\\\/]Arch-Category_32[\\\/][\w-]+.svg/
                ) ||
                entry.fileName.match(
                  /Resource-Icons_[\d]+[\\\/][\w-]+[\\\/][\w-]+.svg/
                ))
            : entry.fileName.endsWith(".svg");

        if (fileFilterRule) {
          // SVG file entry (regardless of directory)
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            fs.mkdir(outputDir, { recursive: true }, (err) => {
              if (err) return reject(err);

              const outputPath = path.join(
                outputDir,
                generateFilename(site, entry.fileName)
              );

              let count = 0;
              let uniquePath = outputPath;
              while (
                outputPaths.has(uniquePath.replace(".svg", `-alt${count}.svg`))
              )
                count += 1;

              if (count !== 0)
                uniquePath = uniquePath.replace(".svg", `-alt${count}.svg`);

              const writeStream = fs.createWriteStream(uniquePath);

              readStream.on("error", reject);
              writeStream.on("error", reject);

              readStream.pipe(writeStream);

              writeStream.on("finish", () => {
                outputPaths.add(uniquePath);
                zipfile.readEntry();
              });
            });
          });
        } else {
          // Not an SVG file or a directory, skip it
          zipfile.readEntry();
        }
      });

      zipfile.on("close", () =>
        resolve(Array.from(outputPaths).sort((a, b) => (a > b ? 1 : -1)))
      );
      zipfile.on("error", reject);

      zipfile.readEntry();
    });
  });
}
