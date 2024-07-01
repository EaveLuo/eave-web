---
sidebar_position: 2
slug: base
title: Basic Usage
description: Introduce the basic usage of Webpack5
tags: [Webpack, packaging tool, front-end engineering]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - basic usage
---

Webpack will use one or more files as the packaging entry point, compile all the files in the project into one or more output files, namely `bundle`, which can be run in the browser.

## Resource directory

```bash
webpack_code # Project root directory
└── src # Project source directory
├── js # js file directory
│ ├── count.js
│ └── sum.js
└── main.js # Project main file
```

## Create files

```js title="count.js"
export default function count(a, b) {
  return a - b;
}
```

```js title="sum.js"
export default function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
```

```js title="main.js"
import count from './js/count';
import sum from './js/sum';

console.log('Difference:', count(10, 3)); // 7
console.log('Sum:', sum(1, 2, 3, 4, 5)); // 15
```

## Download dependencies

Open the terminal, enter the project root directory, and run the following command to initialize package.json:

```bash npm2yarn
npm init -y
```

A basic `package.json` file will be generated at this time:

```json
{
  "name": "webpack-demo",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}
```

**Note that the `name` field in `package.json` cannot be called `webpack`, Otherwise, the next step will report an error**.

Then download the dependencies:

```bash npm2yarn
npm i webpack webpack-cli -D
```

## Enable Webpack

Development mode

```bash
npx webpack ./src/main.js --mode=development
```

Production mode

```bash
npx webpack ./src/main.js --mode=production
```

- `npx webpack`: Run the locally installed `Webpack` package.

- `./src/main.js`: Specify `Webpack` to start packaging from the `main.js` file, including its dependent files.

- `--mode=xxx`: Specify the mode (environment).

## Observe the output file

By default, Webpack will package and output the files to the `dist` directory. Just check the files in the `dist` directory.

## Summary

Webpack itself can only process `JS` resources. When processing other types of resources (such as `CSS`), additional `loader` and `plugin` need to be configured.
