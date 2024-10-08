import fs from "fs/promises";
import { Validator } from "jsonschema";
import path from "path";
import process from "process";

import { doesPathExist } from "../utils.js";

const PROVIDERS_FILE = path.join(process.cwd(), "config", "providers.json");
const PROVIDERS_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  description: "An array of cloud provider configuration objects.",
  minItems: 1,
  items: {
    type: "object",
    properties: {
      site: { type: "string", pattern: "^[a-zA-Z]+$" },
      url: { type: "string", format: "uri" },
      actions: {
        type: "array",
        description:
          "An array of actions to perform on the provider's website.",
        minItems: 1,
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["click", "attribute"],
            },
            locator: {
              type: "string",
              minLength: 1,
            },
          },
          required: ["type", "locator"],
        },
      },
    },
    required: ["site", "url", "actions"],
  },
};

/**
 * @typedef {Object} Action
 * @property {string} type - The action type (supports: "click", "attribute")
 * @property {string} locator - The value used for locating the element
 */

/**
 * @typedef {Object} Provider
 * @property {string} site - The name of the provider
 * @property {string} url - The URL of the provider icon asset page
 * @property {Action[]} actions - An array of actions to perform on the icon page
 */

/**
 * Loads the Providers Configuration file
 *
 * @returns {Promise<Array<Provider>>} Returns the Providers Configuration
 *
 * @throws {Error} Invalid Providers Configuration
 * @throws {Error} Missing Providers Configuration
 */
export default async function loadProvidersConfig() {
  if (await doesPathExist(PROVIDERS_FILE)) {
    console.log("Loading Providers Configuration...");
    const data = await fs.readFile(PROVIDERS_FILE, { encoding: "utf8" });
    const config = JSON.parse(data);
    const validator = new Validator();
    const result = validator.validate(config, PROVIDERS_SCHEMA);

    if (!result.valid)
      throw new Error("Invalid Providers Configuration", { cause: result });

    return config;
  }

  throw new Error("Missing Providers Configuration", { cause: PROVIDERS_FILE });
}
