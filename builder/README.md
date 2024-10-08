# builder

This folder contains all the methods to build the icons library

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                        | Action                                                |
| :----------------------------- | :---------------------------------------------------- |
| `pnpm --filter builder source` | Sources the Asset Links from the Cloud Provider sites |

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
