import css from "css";
import fs from "fs/promises";
import { optimize } from "svgo";
import svgson from "svgson";

import { doesPathExist } from "../utils.js";

/**
 * @typedef Node
 * @property {string} name The name of the node (e.g., "svg", "defs", "style").
 * @property {string} type The type associated with the node value (e.g., "element", "text").
 * @property {string} value The value associated with the node
 * @property {Node | null} parent The parent node of this node, or null if it's the root.
 * @property {Object<string, string>} attributes An object containing key-value pairs representing the attributes of the node.
 * @property {Array<Node>} children An array of child nodes of this node.
 */

/**
 * Traverses the AST using Depth-First Search
 *
 * @param {Node} root - Head of AST
 * @param {(node: Node) => void} cb - The callback that handles the node
 */
function visit(root, cb) {
  cb(root);

  if (root.children && root.children.length > 0)
    for (const child of root.children) visit(child, cb);
}

/**
 * Traverses the AST to find the CSS styles.
 *
 * @param {Node} root - Head of the AST
 *
 * @returns {Object<string, string>} An object containing key-value pairs representing the class names and its styles
 */
function parseStyleTags(root) {
  const styleRules = {};

  visit(root, (node) => {
    if (node.name === "style") {
      for (const child of node.children) {
        const stylesheetAST = css.parse(child.value);

        if (stylesheetAST && stylesheetAST.stylesheet) {
          if (
            stylesheetAST.stylesheet.parsingErrors &&
            stylesheetAST.stylesheet.parsingErrors.length !== 0
          )
            throw new Error("Unable to parse CSS", {
              cause: stylesheetAST.stylesheet.parsingErrors.join("\n"),
            });

          for (const rule of stylesheetAST.stylesheet.rules) {
            for (const selector of rule.selectors) {
              if (!Object.keys(styleRules).includes(selector))
                styleRules[selector] = "";

              for (const declaration of rule.declarations)
                styleRules[selector] +=
                  declaration.property + ": " + declaration.value + "; ";

              styleRules[selector] = styleRules[selector].trim();
            }
          }
        }
      }
    }
  });

  return styleRules;
}

/**
 * Traverses the SVG AST to update attributes
 *
 * @param {Node} root - Head of the SVG AST
 * @param {Object<string, string>} styleRules - An object containing key-value pairs representing the class names and its styles
 *
 * @returns {Node} Updated SVG AST with modified attributes
 */
function updateAttrs(root, styleRules) {
  let updatedRoot = {};

  visit(root, (node) => {
    for (const child of node.children) {
      for (const attribute of Object.keys(child.attributes)) {
        if (attribute === "class") {
          // Replaces class attribute with style
          const styleAttrs = styleRules[`.${child.attributes[attribute]}`];
          child.attributes.style = styleAttrs;
          delete child.attributes.class;
        } else if (attribute.match(/data-\w+/)) {
          // Removes the data-* attributes
          delete child.attributes[attribute];
        }
      }
    }

    updatedRoot = root;
  });

  return updatedRoot;
}

/**
 * Adds the <title> tag to the SVG AST
 *
 * @param {Node} root - Head of the SVG AST
 * @param {string} value - Title for the icon
 *
 * @returns {Node} Updated SVG AST with title tag
 */
function addTitleTag(root, value) {
  if (root.name !== "svg") return root;

  root.attributes["aria-labelledby"] = "icon-name";

  const titleTag = {
    name: "title",
    type: "element",
    value: "",
    parent: null,
    attributes: {
      id: "icon-name",
    },
    children: [
      {
        name: "",
        type: "text",
        value,
        parent: null,
        attributes: {},
        children: [],
      },
    ],
  };

  for (const childIdx in root.children)
    if (root.children[childIdx].name === "title")
      root.children.splice(childIdx, 1);

  root.children.unshift(titleTag);

  return root;
}

/**
 * Optimizes the SVG file
 *
 * @param {Array<string>} filePaths - The paths of all the svg files
 *
 * @returns {Promise<void>}
 */
export default async function optimizeSVG(filePaths) {
  for (const filePath of filePaths) {
    if (await doesPathExist(filePath)) {
      let svgContent = await fs.readFile(filePath, {
        encoding: "utf8",
      });

      let svgAST = await svgson.parse(svgContent);
      const styleRules = parseStyleTags(svgAST);

      svgAST = updateAttrs(svgAST, styleRules);
      svgContent = svgson.stringify(svgAST);

      const optimizedSVG = optimize(svgContent, {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
          "convertStyleToAttrs",
          "prefixIds",
          "removeDimensions",
        ],
      });

      await fs.writeFile(filePath, optimizedSVG.data, {
        encoding: "utf-8",
      });
    }
  }
}
