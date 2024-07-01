---
sidebar_position: 15
slug: source-map
title: Configure SourceMap
tags: [Webpack, bundler, front-end engineering, SourceMap]
keywords:
  - Webpack
  - bundler
  - front-end engineering
  - SourceMap
---

SourceMap is a technology used to debug compressed or compiled code. It maps compressed or compiled code back to the original source code, allowing developers to view the original code in the browser's developer tools and debug it.

## Why configure

During development, the code we run is compiled by webpack, such as the following:

```js
/*
* ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
* This devtool is neither made for production nor for readable output files.
* It uses "eval()" calls to create a separate source file in the browser devtools.
* If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
* or disable the default devtool with "devtool: false".
* If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
*/
/******/ (() => { // webpackBootstrap
/******/ "use strict";
/******/ var __webpack_modules__ = ({

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/less/index.less":
/*!*******************************************************************************************************************\
!*** ​​./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/less/index.less ***!
\**************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */ \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ \"./node_modules/css-loader/dist/runtime/noSourceMaps.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);\n// Imports\n\n\nvar ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, \".box2 {\\n width: 100px;\\n height: 100px;\\n background-color: deeppink;\\n}\\n\", \"\"]);\n// Exports\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);\n\n\n//# sourceURL=webpack://webpack5/./src/less/index.less?./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js");

/***/ }),
// Others omitted
```

All css and js are merged into one file, and other codes are added. At this time, if the code runs wrong, we can't understand the error location of the code. Once there are many code files in the future, it will be difficult to find where the error occurs.

So we need more accurate error prompts to help us develop code better.

## How to configure

By looking at the [Webpack DevTool documentation](https://webpack.docschina.org/configuration/devtool/), we can see that there are many different values ​​for SourceMap.

But in actual development, we only need to focus on two situations:

- Development mode: `cheap-module-source-map`

- Advantages: Fast package compilation, only contains row mapping

- Disadvantages: No column mapping

```js
module.exports = {
  // Others omitted
  mode: 'development',
  devtool: 'cheap-module-source-map',
};
```

- Production mode: `source-map`
- Advantages: Contains row/column mapping
- Disadvantages: Slower package compilation

```js
module.exports = {
  // Others omitted
  mode: 'production',
  devtool: 'source-map',
};
```
