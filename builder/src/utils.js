import fs from "fs/promises";

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
 * Recreates a directory.
 *
 * @param {string} dirPath The path to the directory.
 *
 * @returns {Promise<void>} Returns a Promise that resolves to void.
 */
export async function recreateDir(dirPath) {
  if (await doesPathExist(dirPath))
    await fs
      .rm(dirPath, { recursive: true })
      .then(() => console.log(`Directory deleted: ${dirPath}`));

  await createDir(dirPath).then(() =>
    console.log(`Successfully recreated ${dirPath}\n`)
  );
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
