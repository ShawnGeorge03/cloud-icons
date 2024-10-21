import { loadOptions, transformAsync } from "@babel/core";
import fs from "fs/promises";
import path from "path";
import process from "process";

export const REACT_ICONS_DIR = path.join(
  path.dirname(process.cwd()),
  "packages",
  "react",
  "icons"
);

export const REACT_INDEX_JS = path.join(
  path.dirname(REACT_ICONS_DIR),
  "index.js"
);

export const REACT_INDEX_DTS = path.join(
  path.dirname(REACT_ICONS_DIR),
  "index.d.ts"
);

/**
 * Converts the SVG file to React
 *
 * @param {Array<string>} filePaths - The paths of all the svg files
 *
 * @returns {Promise<void>}
 */
export async function convertSVGtoReact(filePaths) {
  const index = [];
  const babelOptions = loadOptions();

  for (const filePath of filePaths) {
    const jsxContent = await fs
      .readFile(filePath.replaceAll("svg", "jsx"), {
        encoding: "utf-8",
      })
      .then((result) =>
        result.replace(
          'xmlns="http://www.w3.org/2000/svg">',
          'xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" ref={ref} {...props}>'
        )
      );

    // TODO: Improve component name
    const componentName = path
      .basename(filePath, ".svg")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1, word.length))
      .join("")
      .replace("Aws", "AWS")
      .replace("Gcp", "GCP");

    let reactCode = `
  import React, { forwardRef } from 'react';

  const ${componentName} = forwardRef((props, ref) => (${jsxContent}));

  ${componentName}.displayName = '${componentName}';

  export default ${componentName};`;

    try {
      reactCode = await transformAsync(reactCode.toString(), babelOptions).then(
        ({ code }) => code
      );
    } catch (error) {
      console.error("Unable to process file :" + filePath, error);
    }

    await fs.writeFile(
      path.join(REACT_ICONS_DIR, componentName + ".jsx"),
      reactCode,
      { encoding: "utf-8" }
    );

    index.push(
      `export { default as ${componentName} } from "./${REACT_ICONS_DIR.split("\\").at(-1)}/${componentName}.jsx";`
    );
  }

  await fs.writeFile(REACT_INDEX_JS, index.join("\n"), { encoding: "utf-8" });
  await fs.writeFile(REACT_INDEX_DTS, index.join("\n"), { encoding: "utf-8" });
}
