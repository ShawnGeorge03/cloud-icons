<h1 align="center">
    <a href="https://cloud-icons.netlify.app" target="_blank" rel="noopener noreferrer">
        <picture>
            <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ShawnGeorge03/cloud-icons/HEAD/.github/logo-dark.svg">
            <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/ShawnGeorge03/cloud-icons/HEAD/.github/logo-light.svg">
            <img alt="Cloud-icons" width="1000" height="150" style="max-width: 100%"
                src="https://raw.githubusercontent.com/ShawnGeorge03/cloud-icons/HEAD/.github/logo-light.svg">
        </picture>
    </a>
</h1>

<p align="center">
    <a href="https://www.npmjs.com/package/cloud-icons?activeTab=versions">
        <img src="https://img.shields.io/npm/v/cloud-icons/react" alt="Latest Release">
    </a>
</p>

## Basic Usage

First, install `@cloud-icons/react` from npm:

```bash
pnpm add @cloud-icons/react
```

Now each icon can be imported individually as a React component:

```js
import { AmazonApiGateway } from "@cloud-icons/react";

function App() {
  return (
    <div>
      <AmazonApiGateway className="size-6 text-blue-500" />

      <div>...</div>
    </div>
  );
}
```
