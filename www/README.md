# cloud-icons

Website to easily find the right cloud service provider icons for SVG and JSX.

[![Netlify Status](https://api.netlify.com/api/v1/badges/78d0cd47-ec0a-4eae-b7d3-7d14903acf58/deploy-status)](https://app.netlify.com/sites/cloud-icons/deploys)

## 🎉 Getting Started

Clone the project from GitHub

```git
git clone https://github.com/ShawnGeorge03/cloud-icons.git
```

Then you can run it by:

```sh
cd cloud-icons
pnpm install
pnpm --filter www dev
```

Open [http://localhost:4321](http://localhost:4321) with your browser to see the
Website.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                                 | Action                                           |
| :-------------------------------------- | :----------------------------------------------- |
| `pnpm --filter www install`             | Installs dependencies                            |
| `pnpm --filter www run dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm lint`                             | Runs ESLint in `src` folder                      |
| `pnpm format`                           | Runs Prettier in `src` folder                    |
| `pnpm --filter www run build`           | Build your production site to `./dist/`          |
| `pnpm --filter www run preview`         | Preview your build locally, before deploying     |
| `pnpm --filter www run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm --filter www run astro -- --help` | Get help using the Astro CLI                     |
