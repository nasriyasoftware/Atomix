[![N|Solid](https://static.wixstatic.com/media/72ffe6_da8d2142d49c42b29c96ba80c8a91a6c~mv2.png)](https://nasriya.net)

# Atomix.
[![NPM License](https://img.shields.io/npm/l/%40nasriya%2Fatomix?color=lightgreen)](https://github.com/nasriyasoftware/Atomix?tab=License-1-ov-file) ![NPM Version](https://img.shields.io/npm/v/%40nasriya%2Fatomix) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40nasriya%2Fatomix) ![Last Commit](https://img.shields.io/github/last-commit/nasriyasoftware/Atomix.svg) [![Status](https://img.shields.io/badge/Status-Stable-lightgreen.svg)](link-to-your-status-page)

##### Visit us at [www.nasriya.net](https://nasriya.net).

Made with ❤️ in **Palestine** 🇵🇸
___
### Overview
A lightweight, zero-dependency utility library for TypeScript and JavaScript, providing modular, well-typed helpers across common domains like strings, arrays, numbers, and time. Designed for consistency, reusability, and seamless integration in Node.js and modern server-side environments.

> [!IMPORTANT]
> 
> 🌟 **Support Our Open-Source Development!** 🌟
> We need your support to keep our projects going! If you find our work valuable, please consider contributing. Your support helps us continue to develop and maintain these tools.
> 
> **[Click here to support us!](https://fund.nasriya.net/)**
> 
> Every contribution, big or small, makes a difference. Thank you for your generosity and support!
___
### Installation
```shell
npm i @nasriya/atomix
```

### Importing
Import in **ES6** module
```ts
import atomix from '@nasriya/atomix';
```

Import in **CommonJS (CJS)**
```js
const atomix = require('@nasriya/atomix').default;
```
___
## Usage Overview

Import the default instance and use the modular helper methods grouped by domain:
Here's a quick example:

```ts
import atomix from '@nasriya/atomix';

// Normalize a file path
const normalizedPath = atomix.path.normalizePath('/Users/Ahmad/Docs/../Downloads');

// Check if a value is a string
if (atomix.valueIs.string('hello world')) {
  console.log('Confirmed string!');
}
```

### Detailed Domain Usage
You can access each domain via the main `atomix` instance followed by the domain name. For example:

```ts
atomix.dataTypes;   // Access the Data Types domain
atomix.valueIs;     // Access the Value Is domain for generic validations
atomix.fs;          // Access the File System domain
```

| Domain (Module)          | Description                                                                                | Examples                                      |
| ------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Data Types (`dataTypes`) | Helpers for `arrays`, `strings`, `numbers`, and more                                       | [Examples](./examples/dataTypes/dataTypes.md) |
| Value Is (`valueIs`)     | Generic validations & type guards across multiple domains, including `instanceOf` and more | [Examples](./examples/valueIs.md)             |
| Path (`path`)            | File and directory path utilities                                                          | [Examples](./examples/path.md)                |
| File System (`fs`)       | Sync and async file operations, access checks                                              | [Examples](./examples/fs.md)                  |
| HTTP (`http`)            | HTTP request/response utilities                                                            | [Examples](./examples/http.md)                |
| Network (`networks`)     | Network utilities                                                                          | [Examples](./examples/networks.md)            |
| Runtime (`runtime`)      | Runtime environment helpers                                                                | [Examples](./examples/runtime.md)             |
| General (`utils`)        | Common utilities and guards                                                                | [Examples](./examples/utils.md)               |
| Tools (`tools`)          | Advanced utility classes such as `TaskQueue` for managing async workflows                  | [Examples](./examples/tools/tools.md)         |

---
## Compatibility

This package is built and tested on **Node.js v22.16.x** and later.  
Earlier versions of Node.js are not guaranteed to be compatible.

Also supports:
- Bun (tested on v1.2.15+)
- Deno (untested, may require polyfills)
___
## License
This software is licensed under the **Nasriya Open License (NOL)**, version 1.0.
Please read the license from [here](https://github.com/nasriyasoftware/Atomix?tab=License-1-ov-file).