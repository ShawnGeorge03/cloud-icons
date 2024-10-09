# builder

This folder contains all the methods to build the icons library

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                          | Action                                                |
| :------------------------------- | :---------------------------------------------------- |
| `pnpm --filter builder source`   | Sources the Asset Links from the Cloud Provider sites |
| `pnpm --filter builder generate` | Generates the SVG and JSX components                  |

## 🔧 Configurations

All configuration files will be located in the [builder/config](./config/)

### providers.json

The `providers.json` will be used by `sourcer` script and contains the instructions
for how to locate the asset link on the cloud providers sites. Each entry contains
the following properties:

- **`name`** _(string)_: The name of the cloud provider with no spaces
  (e.g., "AWS", "Azure", "GCP").
- **`url`** _(string)_: The **URL** of the webpage where icon package link exists.
- **`actions`** _(array of objects)_: An array of objects defining actions needed
  to scrape the download link. Each action object has the following properties:
  - **`type`** _(string)_: The type of action to perform. Supported types are:
    - **click** - Click on an element.
    - **attribute** - Extract an attribute value from an element.
  - **`locator`** _(string)_: A CSS selector or XPath expression identifying the
    element to interact with.

#### Example

```json
{
  "name": "ExampleDomain",
  "url": "https://example.com",
  "actions": [
    {
      "type": "click",
      "locator": "More information..."
    },
    {
      "type": "attribute",
      "locator": "RFC 2606"
    }
  ]
}
```

### sources.json

The `sources.json` will be used by `generator` script and contains links to download
each of the cloud providers asset packages. The key corresponds to the provider name
from the `providers.json`, and the value is the asset package download URL.

#### Example

```json
{
  "ExampleDomain": "https://example.com/file.zip",
  "ExampleOrg": "https://example.org/file1.zip"
}
```
