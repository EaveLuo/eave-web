---
sidebar_position: 20
slug: create-loader
title: Create Loader
tags: [Webpack, Packaging tool, Front-end engineering]
keywords:
  - Webpack
  - Packaging tool
  - Front-end engineering
  - loader
---

Loader is the core of webpack, which helps webpack convert different types of files into modules that webpack can recognize.

## Loader execution order

Classification

- pre: Preloader
- normal: Normal loader
- inline: Inline loader
- post: Postloader

Execution order

- The execution priority of the 4 types of loaders is: `pre > normal > inline > post`.
- The execution order of loaders with the same priority is: `from right to left, from bottom to top`.

For example:

```js
// At this time, the loader execution order is: loader3 - loader2 - loader1
module: {
rules: [
{
test: /\.js$/,
loader: "loader1",
},
{
test: /\.js$/,
loader: "loader2",
},
{
test: /\.js$/,
loader: "loader3",
},
],
},
```

```js
// At this time, the loader execution order is: loader1 - loader2 - loader3
module: {
rules: [
{
enforce: "pre",
test: /\.js$/,
loader: "loader1",
},
{
// No enforce is normal
test: /\.js$/,
loader: "loader2",
},
{
enforce: "post",
test: /\.js$/,
loader: "loader3",
},
],
},
```

How to use loaders

- Configuration method: specify loaders in the `webpack.config.js` file. (pre, normal, post loaders)

- Inline method: explicitly specify loaders in each `import` statement. (inline loader)

inline loader

Usage: `import Styles from 'style-loader!css-loader?modules!./styles.css';`

Meaning:

- Use `css-loader` and `style-loader` to process the `styles.css` file

- Separate loaders in resources through `!`

`inline loader` can skip other types of loaders by adding different prefixes.

- `!` skips normal loader.

`import Styles from '!style-loader!css-loader?modules!./styles.css';`

- `-!` Skip pre and normal loaders.

`import Styles from '-!style-loader!css-loader?modules!./styles.css';`

- `!!` Skip pre, normal and post loaders.

`import Styles from '!!style-loader!css-loader?modules!./styles.css';`

## Develop a loader

### The simplest loader

```js title="loaders/loader1.js"
module.exports = function loader1(content) {
  console.log('hello loader');
  return content;
};
```

It accepts the source code to be processed as a parameter and outputs the converted js code.

### Parameters accepted by the loader

- `content` The content of the source file
- `map` SourceMap data
- `meta` Data, which can be anything

## Loader categories

### Synchronous loaders

```js
module.exports = function (content, map, meta) {
  return content;
};
```

The `this.callback` method is more flexible because it allows passing multiple parameters, not just `content`.

```js
module.exports = function (content, map, meta) {
  // Pass map to keep source-map uninterrupted
  // Pass meta to allow the next loader to receive other parameters
  this.callback(null, content, map, meta);
  return; // When callback() function is called, it always returns undefined
};
```

### Asynchronous loader

```js
module.exports = function (content, map, meta) {
  const callback = this.async();
  // Perform asynchronous operation
  setTimeout(() => {
    callback(null, result, map, meta);
  }, 1000);
};
```

> Since synchronous calculation is too time-consuming, it is not a good solution to perform this operation in a single-threaded environment such as Node.js. We recommend making your loader asynchronous as much as possible. But if the amount of calculation is small, synchronous loader is also possible.

### Raw Loader

By default, resource files are converted to UTF-8 strings and then passed to the loader. By setting raw to true, the loader can receive the original Buffer.

```js
module.exports = function (content) {
  // content is a Buffer data
  return content;
};
module.exports.raw = true; // Enable Raw Loader
```

### Pitching Loader

```js
module.exports = function (content) {
  return content;
};
module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  console.log('do somethings');
};
```

webpack will first execute the pitch method (if any) on each loader in the loader chain from left to right, and then execute the normal loader method on each loader in the loader chain from right to left.

![Loader execution flow](https://tecent-oss-shanghai.eaveluo.com/img/202407011828542.png?imageSlim)

During this process, if any pitch has a return value, the loader chain is blocked. Webpack will skip all subsequent pitches and loaders and directly enter the previous loader.

![Loader execution flow](https://tecent-oss-shanghai.eaveluo.com/img/202407011828440.png?imageSlim)

## Loader API

| Method name             | Meaning                                                                                    | Usage                                          |
| ----------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| this.async              | Asynchronous callback loader. Return this.callback                                         | const callback = this.async()                  |
| this.callback           | A function that can be called synchronously or asynchronously and returns multiple results | this.callback(err, content, sourceMap?, meta?) |
| this.getOptions(schema) | Get loader options                                                                         | this.getOptions(schema)                        |
| this.emitFile           | Generate a file                                                                            | this.emitFile(name, content, sourceMap)        |
| this.utils.contextify   | Return a relative path                                                                     | this.utils.contextify(context, request)        |
| this.utils.absolutify   | Return an absolute path                                                                    | this.utils.absolutify(context, request)        |

> For more documents, please refer to [webpack official loader api documentation](https://webpack.docschina.org/api/loaders/#the-loader-context)

## Handwritten clean-log-loader

Purpose: used to clean up js `console.log` in the code

```js title="loaders/clean-log-loader.js"
module.exports = function cleanLogLoader(content) {
  // Replace console.log with nothing
  return content.replace(/console\.log\(.*\);?/g, '');
};
```

## Handwritten banner-loader

Function: Add text comments to js code

```js title="loaders/banner-loader/index.js"
const schema = require('./schema.json');

module.exports = function (content) {
  // Get loader options and verify options content
  // schema is the verification rule of options (comply with JSON schema rules)
  const options = this.getOptions(schema);

  const prefix = `
/*
* Author: ${options.author}
*/
`;

  return `${prefix} \n ${content}`;
};
```

```json title="loaders/banner-loader/schema.json"
{
  "type": "object",
  "properties": {
    "author": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

## Handwritten babel-loader

Function: compile js code and compile ES6+ syntax into ES5- syntax.

- Download dependencies

```
npm i @babel/core @babel/preset-env -D
```

```js title="loaders/babel-loader/index.js"
const schema = require('./schema.json');
const babel = require('@babel/core');

module.exports = function (content) {
  const options = this.getOptions(schema);
  // Use asynchronous loader
  const callback = this.async();
  // Use babel to compile js code
  babel.transform(content, options, function (err, result) {
    callback(err, result.code);
  });
};
```

```json title="loaders/banner-loader/schema.json"
{
  "type": "object",
  "properties": {
    "presets": {
      "type": "array"
    }
  },
  "additionalProperties": true
}
```

## Handwritten file-loader

Function: Output the file intact

- Download package

```
npm i loader-utils -D
```

```js title="loaders/file-loader.js"
const loaderUtils = require('loader-utils');

function fileLoader(content) {
  // Generate a new file name based on the file content
  const filename = loaderUtils.interpolateName(this, '[hash].[ext]', {
    content,
  });
  // Output file
  this.emitFile(filename, content);
  // Expose it and give it to js for reference.
  // Remember to add ''
  return `export default '${filename}'`;
}

// loader solves binary content
// Image is Buffer data
fileLoader.raw = true;

module.exports = fileLoader;
```

```js title="webpack.config.js"
{
test: /\.(png|jpe?g|gif)$/,
loader: "./loaders/file-loader.js",
type: "javascript/auto", // Solve the problem of repeated image packaging
},
```

## Handwritten style-loader

Function: Dynamically create style tags, insert style code in js, and make the style effective.

```js title="loaders/style-loader.js"
const styleLoader = () => {};

styleLoader.pitch = function (remainingRequest) {
  /*
remainingRequest: C:\Users\86176\Desktop\source\node_modules\css-loader\dist\cjs.js!C:\Users\86176\Desktop\source\src\css\index.css
This is the usage of inline loader, which means there is another css-loader waiting to be processed

Finally, we need to convert the path in remainingRequest into a relative path so that webpack can process it
Hope to get: ../../node_modules/css-loader/dist/cjs.js!./index.css

So: the absolute path needs to be converted into a relative path
Requirements:
1. It must be a relative path
2. The relative path must start with ./ or ../
3. The path separator of the relative path must be /, not \
*/
  const relativeRequest = remainingRequest
    .split('!')
    .map((part) => {
      // Convert the path to a relative path
      const relativePath = this.utils.contextify(this.context, part);
      return relativePath;
    })
    .join('!');

  /*
!!${relativeRequest}
relativeRequest: ../../node_modules/css-loader/dist/cjs.js!./index.css
relativeRequest is the usage of inline loader, which means that the index.css resource to be processed is processed by css-loader
!! means disabling all configured loaders and using only inline loader. (That is, our style-loader and css-loader outside), they are disabled, and only the inline loader we specified, that is, css-loader, is used

import style from "!!${relativeRequest}"
Import the CSS file processed by css-loader
Why do we need css-loader to process CSS files, can't we directly read the CSS files and use them?
Because there may be @import import CSS syntax, these syntaxes must be parsed by css-loader to become a CSS file, otherwise the CSS resources we introduced will be missing
const styleEl = document.createElement('style')
Dynamically create style tags
styleEl.innerHTML = style
Set the content of the style tag to the processed CSS code
document.head.appendChild(styleEl)
Add to head to take effect
*/
  const script = `
import style from "!!${relativeRequest}"
const styleEl = document.createElement('style')
styleEl.innerHTML = style
document.head.appendChild(styleEl)
`;

  // style-loader is the first loader, because return causes fuse, so other loaders are not executed (regardless of normal or pitch)
  return script;
};

module.exports = styleLoader;
```
