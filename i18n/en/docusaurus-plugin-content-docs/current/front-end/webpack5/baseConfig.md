---
sidebar_position: 3
slug: base-config
title: Basic Configuration
tags: [Webpack, Packaging Tool, Front-end Engineering]
keywords:
  - Webpack
  - Packaging Tool
  - Front-end Engineering
  - Basic Configuration
---

Before we start using `Webpack`, we need to have a certain understanding of the configuration of `Webpack`.

## 5 Core Concepts

- entry: Instructs Webpack which file to start packaging from.

- output: Instructs Webpack where to output the packaged file and how to name it.

- loader: Webpack itself can only process resources such as JS and JSON, and other resources need to be parsed with the help of loader.

- plugins: Expand the functions of Webpack.

- mode: There are mainly development mode and production mode.

- Development mode: used in the development stage, providing friendly error prompts and complete source code for debugging.

- Production mode: used in the release stage, optimize and compress code to improve performance.

## Prepare Webpack configuration file

Create a new file in the project root directory: `webpack.config.js`

```js title="webpack.config.js"
module.exports = {
  // Entry
  entry: '',
  // Output
  output: {},
  // Loader
  module: {
    rules: [],
  },
  // Plug-in
  plugins: [],
  // Mode
  mode: '',
};
```

Webpack runs on Node.js, so it uses Common.js modular specifications.

## Modify the configuration file

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  // Entry
  entry: './src/main.js',
  // Output
  output: {
    // File output directory, must be an absolute path
    path: path.resolve(__dirname, 'dist'),
    // Output file name
    filename: 'main.js',
  },
  // Loader
  module: {
    rules: [],
  },
  // Plug-in
  plugins: [],
  // Mode
  mode: 'development', // Development mode
};
```

## Run command

```bash
npx webpack
```

The function is the same as before, and other resource files such as styles cannot be processed. The subsequent chapters will introduce how to process other resource files.

## Summary

Webpack will be configured through the `webpack.config.js` file to enhance the functionality of Webpack.

We will later build the configuration of Webpack in development mode and production mode respectively, starting with development mode and then completing production mode.
