import fs from "fs/promises";
import { Validator } from "jsonschema";
import path from "path";
import process from "process";

import { doesPathExist } from "../utils.js";

const SOURCES_FILE = path.join(process.cwd(), "config", "sources.json");
const SOURCES_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  description: "A map of cloud provider names to their asset download URLs.",
  patternProperties: {
    "^[a-zA-Z]+$": {
      type: "string",
      format: "uri",
    },
  },
  additionalProperties: false,
};

/**
 * Updates the Sources Configuration.
 *
 * @param {Map} config - Updated Sources Configuration.
 *
 * @throws {Error} Invalid Sources Configuration.
 */
export async function createSourcesConfig(config) {
  if (typeof config === "object")
    return await fs.writeFile(
      SOURCES_FILE,
      JSON.stringify(config, null, 2),
      (error) => {
        if (error) {
          console.log("An error has occurred ", error);
          return;
        }
      }
    );

  throw new Error("Invalid Sources Configuration", {
    cause: `Must contain an object instead of ${typeof config}`,
  });
}

/**
 * Loads the Sources Configuration file
 *
 * @returns {Promise<Object>} Returns the Sources Configuration
 *
 * @throws {Error} Invalid Sources Configuration
 * @throws {Error} Missing Sources Configuration
 */
export default async function loadSourcesConfig() {
  console.log("Loading Sources Configuration\n");
  if (await doesPathExist(SOURCES_FILE)) {
    const data = await fs.readFile(SOURCES_FILE, { encoding: "utf8" });
    const config = JSON.parse(data);
    const validator = new Validator();

    const result = validator.validate(config, SOURCES_SCHEMA);

    if (!result.valid)
      throw new Error("Invalid Sources Configuration", { cause: result });

    return config;
  }

  throw new Error("Missing Sources Configuration", { cause: SOURCES_FILE });
}
