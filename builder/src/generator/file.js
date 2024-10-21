import path from "path";

/**
 * Represents a replacement rule for string manipulation.
 * @typedef {Object} Replacement
 * @property {RegExp} pattern - The regular expression pattern to match in the string.
 * @property {string} replacement - The string to replace the matched pattern with.
 */

const rules = {
  AWS: {
    replace: [
      {
        pattern: /^arch_|_48|32|arch-category_|res_|-|_|&| /g,
        replacement: " ",
      },
      { pattern: /aternate/g, replacement: "alternate" },
    ],
    prefix: ["amazon"],
  },
  Azure: {
    replace: [
      { pattern: /\d+-icon-service|_|-|\(|\)/g, replacement: " " },
      { pattern: /\+/g, replacement: "plus" },
      { pattern: /attestation/g, replacement: " attestation" },
      { pattern: /machinesazurearc/g, replacement: "machines azure arc" },
    ],
    prefix: ["microsoft"],
  },
  GCP: {
    replace: [{ pattern: /_|-/g, replacement: " " }],
    prefix: ["google"],
  },
};

/**
 * Applies replacements to the filename.
 *
 * @param {string} filename - Name of the file.
 * @param {Array<Replacement>} replacements - Replacement rules for filename.
 *
 * @returns {string} - Modified filename after applying replacements
 */
const applyReplacements = (filename, replacements) => {
  return replacements.reduce((acc, { pattern, replacement }) => {
    return acc.replace(pattern, replacement);
  }, filename);
};

/**
 * Adds a prefix to a string if it doesn't already contain any of the specified alternatives.
 *
 * Some services may exist on multiple CSPs eg. Savings Plan, by adding
 * a prefix it ensures that both icons can exist in the directory
 *
 * @param {string} filename - Name of the file.
 * @param {string} prefix - The prefix to add if necessary.
 * @param {string[]} alternatives - An array of alternative strings to check for.
 *
 * @returns {string} The input string with the prefix added if necessary.
 */
const addPrefixIfMissing = (filename, prefix, alternatives) => {
  return !alternatives.some((alt) =>
    filename.toLowerCase().includes(alt.toLowerCase())
  )
    ? `${prefix} ${filename}`
    : filename;
};

/**
 * Generates a unique filename based on the input filename and the specified site.
 *
 * @param {string} site - The site identifier (e.g., "AWS", "Azure", "GCP").
 * @param {string} filename - The original filename to process.
 *
 * @returns {string} The generated unique filename.
 *
 * @throws {Error} If an invalid site is provided.
 */
export default function generateFilename(site, filename) {
  if (!Object.keys(rules).includes(site))
    throw new Error("Invalid Site", { cause: site });

  const { replace, prefix } = rules[site];

  let uniqueFilename = path.basename(filename, ".svg").toLowerCase();
  uniqueFilename = applyReplacements(uniqueFilename, replace).trim();
  uniqueFilename = addPrefixIfMissing(uniqueFilename, site.toLowerCase(), [
    site.toLowerCase(),
    ...prefix,
  ]);

  return uniqueFilename.split(/\s+/).join("-") + ".svg";
}
