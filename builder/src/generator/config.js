import fs from "fs/promises";
import path from "path";
import process from "process";

const SOURCES_FILE = path.join(process.cwd(), "config", "sources.json");

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
