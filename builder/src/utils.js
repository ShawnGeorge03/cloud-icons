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
