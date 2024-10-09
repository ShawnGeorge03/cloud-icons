import eslintPluginAstro from "eslint-plugin-astro";

export default [
  { files: ["**/*.{astro,js,mjs,cjs,ts}"] },
  { ignores: ["dist/*", ".astro/*", "src/env.d.ts"] },

  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["jsx-a11y-strict"],
];