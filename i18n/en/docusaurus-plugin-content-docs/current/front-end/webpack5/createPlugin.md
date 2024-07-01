---
sidebar_position: 21
slug: create-plugin
title: Create Plugin
tags: [Webpack, Packaging Tool, Front-end Engineering]
keywords:
  - Webpack
  - Packaging Tool
  - Front-end Engineering
  - Plugin
---

Through plugins, we can extend webpack and add custom build behaviors, so that webpack can perform a wider range of tasks and have stronger build capabilities.

## How Plugin works

> Webpack is like a production line. It must go through a series of processing flows to convert source files into output results. Each processing flow on this production line has a single responsibility, and there are dependencies between multiple flows. Only after the current processing is completed can it be handed over to the next flow for processing.
> A plugin is like a function inserted into a production line, processing resources on the production line at a specific time. Webpack organizes this complex production line through Tapable. Webpack broadcasts events during operation. Plugins only need to listen to the events they care about to join this production line and change the operation of the production line.
> The event flow mechanism of webpack ensures the orderliness of the plug-in, making the entire system very scalable.
> ——「Webpack in Depth and Ease」

From the perspective of code logic: webpack will trigger a series of `Tapable` hook events during code compilation. What the plug-in does is to find the corresponding hook and hang its own task on it, that is, register the event. In this way, when webpack is built, the event registered by the plug-in will be executed as the hook is triggered.

## Hooks inside Webpack

### What is a hook

The essence of a hook is: event. In order to facilitate our direct intervention and control of the compilation process, webpack encapsulates various key events triggered during the compilation process into event interfaces and exposes them. These interfaces are vividly called: `hooks` (hooks). These hooks are indispensable for developing plug-ins.

### Tapable

`Tapable` provides a unified plug-in interface (hook) type definition for webpack, which is the core function library of webpack. There are currently ten kinds of `hooks` in webpack, which can be seen in the `Tapable` source code. They are:

```js
// https://github.com/webpack/tapable/blob/master/lib/index.js
exports.SyncHook = require('./SyncHook');
exports.SyncBailHook = require('./SyncBailHook');
exports.SyncWaterfallHook = require('./SyncWaterfallHook');
exports.SyncLoopHook = require('./SyncLoopHook');
exports.AsyncParallelHook = require('./AsyncParallelHook');
exports.AsyncParallelBailHook = require('./AsyncParallelBailHook');
exports.AsyncSeriesHook = require('./AsyncSeriesHook');
exports.AsyncSeriesBailHook = require('./AsyncSeriesBailHook');
exports.AsyncSeriesLoopHook = require('./AsyncSeriesLoopHook');
exports.AsyncSeriesWaterfallHook = require('./AsyncSeriesWaterfallHook');
exports.HookMap = require('./HookMap');
exports.MultiHook = require('./MultiHook');
```

`Tapable` also exposes three methods to plugins to inject different types of custom build behaviors:

- `tap`: You can register synchronous hooks and asynchronous hooks.

- `tapAsync`: Register asynchronous hooks in callback mode.

- `tapPromise`: Register asynchronous hooks in Promise mode.

## Plugin build object

### Compiler

The compiler object stores the complete Webpack environment configuration. It is a unique object created only once each time the webpack build is started.

This object will be created when Webpack is started for the first time. We can access the main environment configuration of Webapck through the compiler object, such as loader, plugin and other configuration information.

It has the following main properties:

- `compiler.options` can access all configuration files when starting webpack this time, including but not limited to loaders, entry, output, plugin and other complete configuration information.

- `compiler.inputFileSystem` and `compiler.outputFileSystem` can perform file operations, which is equivalent to fs in Nodejs.

- `compiler.hooks` can register different types of tapable Hooks, so that different logic can be implanted in the compiler life cycle.

> [compiler hooks documentation](https://webpack.docschina.org/api/compiler-hooks/)

### Compilation

The compilation object represents a resource build, and the compilation instance can access all modules and their dependencies.

A compilation object compiles all modules in the build dependency graph. During the compilation phase, modules are loaded, sealed, optimized, chunked, hashed, and restored.

It has the following main properties:

- `compilation.modules` can access all modules, and each packaged file is a module.

- `compilation.chunks` chunk is a code block composed of multiple modules. The resources introduced by the entry file form a chunk, and the modules separated by code are another chunk.

- `compilation.assets` can access the results of all files generated by this packaging.
- `compilation.hooks` can register different types of tapable Hooks for adding and modifying logic during the compilation module phase.

> [compilation hooks documentation](https://webpack.docschina.org/api/compilation-hooks/)

### Life cycle diagram

![Webpack plugin life cycle](https://tecent-oss-shanghai.eaveluo.com/img/202407011830874.jpg?imageSlim)

## Develop a plugin

### The simplest plugin

```js title="plugins/test-plugin.js"
class TestPlugin {
  constructor() {
    console.log('TestPlugin constructor()');
  }
  // 1. When webpack reads the configuration, new TestPlugin() will execute the plugin constructor method
  // 2. webpack creates a compiler object
  // 3. Traverse all plugins and call the plugin's apply method
  apply(compiler) {
    console.log('TestPlugin apply()');
  }
}

module.exports = TestPlugin;
```

### Register hook

```js title="plugins/test-plugin.js"
class TestPlugin {
  constructor() {
    console.log('TestPlugin constructor()');
  }
  // 1. When webpack reads the configuration, new TestPlugin() will execute the plugin constructor method
  // 2. webpack creates a compiler object
  // 3. Traverse all plugins and call the apply method of the plugin
  apply(compiler) {
    console.log('TestPlugin apply()');

    // From the document, we know that compile hook is SyncHook, which is a synchronous hook and can only be registered with tap
    compiler.hooks.compile.tap('TestPlugin', (compilationParams) => {
      console.log('compiler.compile()');
    });

    // From the document, we know that make is AsyncParallelHook, which is an asynchronous parallel hook, The feature is that asynchronous tasks are executed simultaneously.
    // You can use tap, tapAsync, tapPromise to register.
    // If you use tap to register, asynchronous operations will not wait for the asynchronous operations to complete.
    compiler.hooks.make.tap('TestPlugin', (compilation) => {
      setTimeout(() => {
        console.log('compiler.make() 111');
      }, 2000);
    });

    // Register with tapAsync and tapPromise. Asynchronous operations will wait until the asynchronous operation is completed before continuing to execute
    compiler.hooks.make.tapAsync('TestPlugin', (compilation, callback) => {
      setTimeout(() => {
        console.log('compiler.make() 222');
        // Must call
        callback();
      }, 1000);
    });

    compiler.hooks.make.tapPromise('TestPlugin', (compilation) => {
      console.log('compiler.make() 333');
      // Must return promise
      return new Promise((resolve) => {
        resolve();
      });
    });

    // From the documentation, emit is AsyncSeriesHook, which is an asynchronous serial hook. Its feature is that asynchronous tasks are executed sequentially.
    compiler.hooks.emit.tapAsync('TestPlugin', (compilation, callback) => {
      setTimeout(() => {
        console.log('compiler.emit() 111');
        callback();
      }, 3000);
    });

    compiler.hooks.emit.tapAsync('TestPlugin', (compilation, callback) => {
      setTimeout(() => {
        console.log('compiler.emit() 222');
        callback();
      }, 2000);
    });

    compiler.hooks.emit.tapAsync('TestPlugin', (compilation, callback) => {
      setTimeout(() => {
        console.log('compiler.emit() 333');
        callback();
      }, 1000);
    });
  }
}

module.exports = TestPlugin;
```

### Start debugging

View the data of `compiler` and `compilation` objects through debugging.

```json title="package.json"
{
  "name": "source",
  "version": "1.0.0",
  "scripts": {
    // highlight-next-line
    "debug": "node --inspect-brk ./node_modules/webpack-cli/bin/cli.js"
  },
  "keywords": [],
  "author": "xiongjian",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.17.10",
    "@babel/preset-env": "^7.17.10",
    "css-loader": "^6.7.1",
    "loader-utils": "^3.2.0",
    "webpack": "^5.72.0",
    "webpack-cli": "^4.9.2"
  }
}
```

Run command

```bash npm2yarn
npm run debug
```

The console outputs the following:

```bash
PS C:\Users\Administrator\Desktop\source> npm run debug

> source@1.0.0 debug
> node --inspect-brk ./node_modules/webpack-cli/bin/cli.js

Debugger listening on ws://127.0.0.1:9229/131415-3gbx-3tg4-45sds-0211415151
For help, see: https://nodejs.org/en/docs/inspecto
```

Open the Chrome browser, and press F12 to open the browser debug console.

At this time, the console will display a green icon

![Debug Console](https://tecent-oss-shanghai.eaveluo.com/img/202407011831385.png?imageSlim)

Click the green icon to enter the debug mode.

Use `debugger` to breakpoint where the code needs to be debugged, and the code will stop running, so that you can debug and view the data.

## BannerWebpackPlugin

Function: add comments to the packaged output file.

Development ideas:

- Need to add comments before packaging output: need to use `compiler.hooks.emit` hook, which is triggered before packaging output.

- How to get the packaged output resources? `compilation.assets` can get all the resource files to be output.

Implementation:

```js title="plugins/banner-webpack-plugin.js"
class BannerWebpackPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    // Need to process files
    const extensions = ['js', 'css'];

    // emit is an asynchronous serial hook
    compiler.hooks.emit.tapAsync(
      'BannerWebpackPlugin',
      (compilation, callback) => {
        // compilation.assets contains all the resources to be output
        // Only keep the files that need to be processed by filtering
        const assetPaths = Object.keys(compilation.assets).filter((path) => {
          const splitted = path.split('.');
          return extensions.includes(splitted[splitted.length - 1]);
        });

        assetPaths.forEach((assetPath) => {
          const asset = compilation.assets[assetPath];

          const source = `/*
* Author: ${this.options.author}
*/\n${asset.source()}`;

          // Overwrite resources
          compilation.assets[assetPath] = {
            // Resource content
            source() {
              return source;
            },
            // Resource size
            size() {
              return source.length;
            },
          };
        });

        callback();
      }
    );
  }
}

module.exports = BannerWebpackPlugin;
```

## CleanWebpackPlugin

Function: Clear the last packaged content before webpack is packaged and output.

Development ideas:

- How to execute before packaging and output? You need to use the `compiler.hooks.emit` hook, which is triggered before packaging and output.
- How to clear the last packaged content?
- Get the packaged output directory: through the compiler object.
- Clear the content through file operations: operate the file through `compiler.outputFileSystem`.

Implementation:

```js title="plugins/clean-webpack-plugin.js"
class CleanWebpackPlugin {
  apply(compiler) {
    // Get the object of the operation file
    const fs = compiler.outputFileSystem;
    // emit is an asynchronous serial hook
    compiler.hooks.emit.tapAsync(
      'CleanWebpackPlugin',
      (compilation, callback) => {
        // Get the output file directory
        const outputPath = compiler.options.output.path;
        // Delete all files in the directory
        const err = this.removeFiles(fs, outputPath);
        // Execution success err is undefined, execution failure err is the error reason
        callback(err);
      }
    );
  }

  removeFiles(fs, path) {
    try {
      // Read all files in the current directory
      const files = fs.readdirSync(path);

      // Traverse files and delete
      files.forEach((file) => {
        // Get the full path of the file
        const filePath = `${path}/${file}`;
        // Analyze the file
        const fileStat = fs.statSync(filePath);
        // Determine whether it is a folder
        if (fileStat.isDirectory()) {
          // If it is a folder, recursively traverse and delete all the files below
          this.removeFiles(fs, filePath);
        } else {
          // If it is not a folder, it is a file, delete it directly
          fs.unlinkSync(filePath);
        }
      });

      // Finally delete the current directory
      fs.rmdirSync(path);
    } catch (e) {
      // Return the generated error
      return e;
    }
  }
}

module.exports = CleanWebpackPlugin;
```

## AnalyzeWebpackPlugin

Purpose: Analyze the size of webpack packaged resources and output analysis files.
Development ideas:

- Where to do it? `compiler.hooks.emit`, it is triggered before packaging output, we need to analyze the resource size and add the analyzed md file.

Implementation:

```js title="plugins/analyze-webpack-plugin.js"
class AnalyzeWebpackPlugin {
  apply(compiler) {
    // emit is an asynchronous serial hook
    compiler.hooks.emit.tap('AnalyzeWebpackPlugin', (compilation) => {
      // Object.entries turns the object into a two-dimensional array. The first value in the two-dimensional array is the key, and the second value is the value
      const assets = Object.entries(compilation.assets);

      let source =
        '# Analyze the size of packaged resources \n| Name | Size |\n| --- | --- |';

      assets.forEach(([filename, file]) => {
        source += `\n| ${filename} | ${file.size()} |`;
      });

      // Add resources
      compilation.assets['analyze.md'] = {
        source() {
          return source;
        },
        size() {
          return source.length;
        },
      };
    });
  }
}

module.exports = AnalyzeWebpackPlugin;
```

## InlineChunkWebpackPlugin

Function: The runtime file generated by webpack packaging is too small, and the performance of sending additional requests is not good, so it needs to be inlined into js to reduce the number of requests.
Development ideas:

- We need to use `html-webpack-plugin` to achieve it
- Inject inline runtime before `html-webpack-plugin` outputs index.html
- Delete redundant runtime files
- How to operate `html-webpack-plugin`? [Official Document](https://github.com/jantimon/html-webpack-plugin/#afteremit-hook)

Implementation:

```js title="plugins/inline-chunk-webpack-plugin.js"
const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin');

class InlineChunkWebpackPlugin {
  constructor(tests) {
    this.tests = tests;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(
      'InlineChunkWebpackPlugin',
      (compilation) => {
        const hooks = HtmlWebpackPlugin.getHooks(compilation);

        hooks.alterAssetTagGroups.tap('InlineChunkWebpackPlugin', (assets) => {
          assets.headTags = this.getInlineTag(
            assets.headTags,
            compilation.assets
          );
          assets.bodyTags = this.getInlineTag(
            assets.bodyTags,
            compilation.assets
          );
        });

        hooks.afterEmit.tap('InlineChunkHtmlPlugin', () => {
          Object.keys(compilation.assets).forEach((assetName) => {
            if (this.tests.some((test) => assetName.match(test))) {
              delete compilation.assets[assetName];
            }
          });
        });
      }
    );
  }

  getInlineTag(tags, assets) {
    return tags.map((tag) => {
      if (tag.tagName !== 'script') return tag;

      const scriptName = tag.attributes.src;

      if (!this.tests.some((test) => scriptName.match(test))) return tag;

      return {
        tagName: 'script',
        innerHTML: assets[scriptName].source(),
        closeTag: true,
      };
    });
  }
}

module.exports = InlineChunkWebpackPlugin;
```
