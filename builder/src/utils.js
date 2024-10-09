import fs from "fs/promises";
import path from "path";

/**
 * Checks if file/directory path exists.
 *
 * @param {string} path The path to the file/directory.
 * @param {number} [mode=fs.constants.F_OK] The mode to use for the access check. (https://nodejs.org/api/fs.html#fs_file_access_constants)
 *
 * @returns {Promise<boolean>} Returns true if it exists, false otherwise.
 */
export async function doesPathExist(path, mode = fs.constants.F_OK) {
  return await fs
    .access(path, mode)
    .then(() => true)
    .catch(() => false);
}

/**
 * Deletes a directory.
 *
 * @param {string} dirPath The path to the directory.
 *
 * @returns {Promise<void>} Returns a Promise that resolves to void.
 */
export async function deleteDir(dirPath) {
  if (await doesPathExist(dirPath))
    await fs
      .rm(dirPath, { recursive: true })
      .then(() => console.log(`Directory deleted: ${dirPath}`));
}

/**
 * Creates a directory.
 *
 * @param {string} dirPath The path of the directory.
 *
 * @returns {Promise<void>} Returns a Promise that resolves to void.
 */
export async function createDir(dirPath) {
  if (!(await doesPathExist(dirPath)))
    await fs
      .mkdir(dirPath, { recursive: true })
      .then(() => console.log(`Directory created: ${dirPath}`));
}

/**
 * Loads all properties from the `package.json`
 *
 * @param {string} dirPath The path of the directory
 *
 * @returns {Object} Returns all properties from the `package.json`
 */
export async function loadPackageJson(dirPath) {
  const packagePath = path.join(dirPath, "package.json");

  if (await doesPathExist(packagePath)) {
    const data = await fs.readFile(packagePath, { encoding: "utf8" });
    return JSON.parse(data);
  }

  throw new Error("Unable to access package.json", { cause: packagePath });
}
