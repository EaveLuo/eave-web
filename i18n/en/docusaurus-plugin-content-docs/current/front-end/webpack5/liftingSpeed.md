---
sidebar_position: 16
slug: lifting-speed
title: Improve the speed of packaging and building
tags: [Webpack, packaging tool, front-end engineering, performance optimization]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - Improve the speed of packaging and building
  - performance optimization
---

In addition to the previous basic configuration, webpack5 can also improve the speed of packaging and building through configuration.

## HotModuleReplacement

Hot Module Replacement (HMR) is a feature provided by Webpack that allows modules to be replaced, added, or deleted during the running of the application without reloading the entire page. It improves development efficiency by maintaining the state of the application.

### Why configure

During development, we modified one of the module codes. By default, Webpack will repackage and compile all modules, which is very slow.

So we need to modify a certain module code, and only this module code needs to be repackaged and compiled, and other modules remain unchanged, so that the packaging speed can be very fast.

### How to configure

```js title="webpack.dev.js"
module.exports = {
  // Others omitted
  devServer: {
    host: 'localhost', // Start server domain name
    port: '3000', // Start server port number
    open: true, // Whether to automatically open the browser
    // highlight-next-line
    hot: true, // Enable HMR function (can only be used in development environment, not required in production environment)
  },
};
```

At this time, the css style has been processed by style-loader and has the HMR function.
But js is not enough, how to make js also have the HMR function?

```js title="main.js"
import count from './js/count';
import sum from './js/sum';
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './sass/index.scss';
import './styl/index.styl';

// highlight-start
// Determine whether HMR function is supported
if (module.hot) {
  module.hot.accept('./js/count.js', function (count) {
    const result1 = count(2, 1);
    console.log(result1);
  });

  module.hot.accept('./js/sum.js', function (sum) {
    const result2 = sum(1, 2, 3, 4);
    console.log(result2);
  });
}
// highlight-end
```

Writing like this is very troublesome, so we will use other loaders to solve the problem in actual development.

For example: [vue-loader](https://github.com/vuejs/vue-loader), [react-hot-loader](https://github.com/gaearon/react-hot-loader).

## OneOf

As the name suggests, it can only match one loader, and the rest will not match.

### Why configure

When packaging, each file will be processed by all loaders. Although it is not actually processed because of the `test` regular expression, it will go through it once. It is relatively slow.

### How to configure

```js title="webpack.dev.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined, // Development mode has no output, no need to specify output directory
    filename: 'static/js/main.js', // Output js file to static/js directory
    // clean: true, // Development mode has no output, no need to clear output results
  },
  module: {
    rules: [
      {
        // highlight-start
        oneOf: [
          {
            // Used to match files ending with .css
            test: /\.css$/,
            // The order of Loader execution in the use array is from right to left
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader'],
          },
          {
            test: /\.s[ac]ss$/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
          },
          {
            test: /\.styl$/,
            use: ['style-loader', 'css-loader', 'stylus-loader'],
          },
          {
            test: /\.(png|jpe?g|gif|webp)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // Images less than 10kb will be processed by base64
              },
            },
            generator: {
              // Output the image file to the static/imgs directory
              // Name the image file [hash:8][ext][query]
              // [hash:8]: The hash value is 8 digits
              // [ext]: Use the previous file extension
              // [query]: Add the previous query parameter
              filename: 'static/imgs/[hash:8][ext][query]',
            },
          },
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
            generator: {
              filename: 'static/media/[hash:8][ext][query]',
            },
          },
          {
            test: /\.js$/,
            exclude: /node_modules/, // Exclude node_modules code from compilation
            loader: 'babel-loader',
          },
        ],
        // highlight-end
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the packaged generated js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  // Development server
  devServer: {
    host: 'localhost', // Start server domain name
    port: '3000', // Start server port number
    open: true, // Whether to automatically open the browser
    hot: true, // Enable HMR function
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
};
```

The production mode is also configured in the same way.

## Include/Exclude

- include

Include, only process xxx files

- exclude

Exclude, process all files except xxx files

### Why configure

During development, we need to use third-party libraries or plug-ins, and all files are downloaded to node_modules. These files can be used directly without compilation.

So when we process js files, we need to exclude the files under node_modules.

### How to configure

````js title="webpack.dev.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
entry: './src/main.js',
output: {
path: undefined, // Development mode has no output, no need to specify output directory
filename: 'static/js/main.js', // Output js file to static/js directory
// clean: true, // Development mode has no output, no need to clear output results
},
module: {
rules: [
{
oneOf: [
{
// Used to match files ending with .css
test: /\.css$/,
// The order of Loader execution in the use array is from right to left
use: ['style-loader', 'css-loader'],
},
{
test: /\.less$/,---
sidebar_position: 16
slug: lifting-speed
title: Improve the speed of packaging and building
tags: [Webpack, packaging tool, front-end engineering, performance optimization]
keywords:
- Webpack
- packaging tool
- front-end engineering
- Improve the speed of packaging and building
- performance optimization
---

In addition to the previous basic configuration, webpack5 can also improve the speed of packaging and building through configuration.

## HotModuleReplacement

Hot Module Replacement (HMR) is a feature provided by Webpack that allows modules to be replaced, added, or deleted during the running of the application without reloading the entire page. It improves development efficiency by maintaining the state of the application.

### Why configure

During development, we modified one of the module codes. By default, Webpack will repackage and compile all modules, which is very slow.

So we need to modify a certain module code, and only this module code needs to be repackaged and compiled, and other modules remain unchanged, so that the packaging speed can be very fast.

### How to configure

```js title="webpack.dev.js"
module.exports = {
// Others omitted
devServer: {
host: 'localhost', // Start server domain name
port: '3000', // Start server port number
open: true, // Whether to automatically open the browser
// highlight-next-line
hot: true, // Enable HMR function (can only be used in development environment, not required in production environment)
},
};
````

At this time, the css style has been processed by style-loader and has the HMR function.
But js is not enough, how to make js also have the HMR function?

```js title="main.js"
import count from './js/count';
import sum from './js/sum';
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './sass/index.scss';
import './styl/index.styl';

// highlight-start
// Determine whether HMR function is supported
if (module.hot) {
  module.hot.accept('./js/count.js', function (count) {
    const result1 = count(2, 1);
    console.log(result1);
  });

  module.hot.accept('./js/sum.js', function (sum) {
    const result2 = sum(1, 2, 3, 4);
    console.log(result2);
  });
}
// highlight-end
```

Writing like this is very troublesome, so we will use other loaders to solve the problem in actual development.

For example: [vue-loader](https://github.com/vuejs/vue-loader), [react-hot-loader](https://github.com/gaearon/react-hot-loader).

## OneOf

As the name suggests, it can only match one loader, and the rest will not match.

### Why configure

When packaging, each file will be processed by all loaders. Although it is not actually processed because of the `test` regular expression, it will go through it once. It is relatively slow.

### How to configure

```js title="webpack.dev.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined, // Development mode has no output, no need to specify output directory
    filename: 'static/js/main.js', // Output js file to static/js directory
    // clean: true, // Development mode has no output, no need to clear output results
  },
  module: {
    rules: [
      {
        // highlight-start
        oneOf: [
          {
            // Used to match files ending with .css
            test: /\.css$/,
            // The order of Loader execution in the use array is from right to left
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader'],
          },
          {
            test: /\.s[ac]ss$/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
          },
          {
            test: /\.styl$/,
            use: ['style-loader', 'css-loader', 'stylus-loader'],
          },
          {
            test: /\.(png|jpe?g|gif|webp)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // Images less than 10kb will be processed by base64
              },
            },
            generator: {
              // Output the image file to the static/imgs directory
              // Name the image file [hash:8][ext][query]
              // [hash:8]: The hash value is 8 digits
              // [ext]: Use the previous file extension
              // [query]: Add the previous query parameter
              filename: 'static/imgs/[hash:8][ext][query]',
            },
          },
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
            generator: {
              filename: 'static/media/[hash:8][ext][query]',
            },
          },
          {
            test: /\.js$/,
            exclude: /node_modules/, // Exclude node_modules code from compilation
            loader: 'babel-loader',
          },
        ],
        // highlight-end
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the packaged generated js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  // Development server
  devServer: {
    host: 'localhost', // Start server domain name
    port: '3000', // Start server port number
    open: true, // Whether to automatically open the browser
    hot: true, // Enable HMR function
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
};
```

The production mode is also configured in the same way.

## Include/Exclude

- include

Include, only process xxx files

- exclude

Exclude, process all files except xxx files

### Why configure

During development, we need to use third-party libraries or plug-ins, and all files are downloaded to node_modules. These files can be used directly without compilation.

So when we process js files, we need to exclude the files under node_modules.

### How to configure

```js title="webpack.dev.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined, // Development mode has no output, no need to specify output directory
    filename: 'static/js/main.js', // Output js file to static/js directory
    // clean: true, // Development mode has no output, no need to clear output results
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            // Used to match files ending with .css
            test: /\.css$/,
            // The order of Loader execution in the use array is from right to left
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader'],
          },
          {
            test: /\.s[ac]ss$/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
          },
          {
            test: /\.styl$/,
            use: ['style-loader', 'css-loader', 'stylus-loader'],
          },
          {
            test: /\.(png|jpe?g|gif|webp)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // Images less than 10kb will be processed by base64
              },
            },
            generator: {
              // Output image files to the static/imgs directory
              // Name the image file [hash:8][ext][query]
              // [hash:8]: The hash value is 8 digits
              // [ext]: Use the previous file extension
              // [query]: Add the previous query parameter
              filename: 'static/imgs/[hash:8][ext][query]',
            },
          },
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
            generator: {
              filename: 'static/media/[hash:8][ext][query]',
            },
          },
          {
            test: /\.js$/,
            // highlight-start
            // exclude: /node_modules/, // Exclude node_modules code from compilation
            include: path.resolve(__dirname, '../src'), // Can also be included
            // highlight-end
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, '../src'),
      // highlight-next-line
      exclude: 'node_modules', // default value
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the packaged js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  // Development server
  devServer: {
    host: 'localhost', // Start server domain name
    port: '3000', // Start server port number
    open: true, // Whether to automatically open the browser
    hot: true, // Enable HMR function
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
};
```

The same configuration is used for production mode.

## Cache

Cache the results of Eslint check and Babel compilation.

### Why configure

Every time you bundle, the js file must go through Eslint check and Babel compilation, which is slow.

We can cache the previous Eslint check and Babel compilation results, so that the second time you bundle, the speed will be faster.

### How to configure

```js title="webpack.dev.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: undefined, // Development mode has no output, no need to specify output directory
    filename: 'static/js/main.js', // Output js file to static/js directory
    // clean: true, // Development mode has no output, no need to clear output results
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            // Used to match files ending with .css
            test: /\.css$/,
            // The order of Loader execution in the use array is from right to left
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader'],
          },
          {
            test: /\.s[ac]ss$/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
          },
          {
            test: /\.styl$/,
            use: ['style-loader', 'css-loader', 'stylus-loader'],
          },
          {
            test: /\.(png|jpe?g|gif|webp)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // Images less than 10kb will be processed by base64
              },
            },
            generator: {
              // Output the image file to the static/imgs directory
              // Name the image file [hash:8][ext][query]
              // [hash:8]: The hash value is 8 digits
              // [ext]: Use the previous file extension
              // [query]: Add the previous query parameter
              filename: 'static/imgs/[hash:8][ext][query]',
            },
          },
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
            generator: {
              filename: 'static/media/[hash:8][ext][query]',
            },
          },
          {
            test: /\.js$/,
            // exclude: /node_modules/, // Exclude node_modules code from compilation
            include: path.resolve(__dirname, '../src'), // Can also be included
            loader: 'babel-loader',
            // highlight-start
            options: {
              cacheDirectory: true, // Enable babel compilation cache
              cacheCompression: false, // Do not compress cache files
            },
            // highlight-end
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules', // default value
      // highlight-start
      cache: true, // Enable cache
      // Cache directory
      cacheLocation: path.resolve(
        __dirname,
        '../node_modules/.cache/.eslintcache'
      ),
      // highlight-end
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the packaged generated js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  // Development server
  devServer: {
    host: 'localhost', // Start server domain name
    port: '3000', // Start server port number
    open: true, // Whether to automatically open the browser
    hot: true, // Enable HMR function
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
};
```

## Thead

Multi-process packaging: Open multiple processes on the computer to do one thing at the same time, which is faster.

**Note: Please only use it in particularly time-consuming operations, because each process startup has an overhead of about 600ms. **

### Why configure

When the project becomes larger and larger, the packaging speed becomes slower and slower, and it may even take an afternoon to package the code. This speed is relatively slow.

We want to continue to improve the packaging speed, in fact, we need to improve the packaging speed of js, because other files are relatively small.

And the main tools for processing js files are eslint, babel, and Terser, so we need to improve their running speed.

We can start multiple processes to process js files at the same time, so the speed is faster than the previous single-process packaging.

### How to configure

The number of processes we start is the number of cores of our CPU. How to get the number of CPU cores? Because each computer is different, we use the os module of nodejs to get it.

```js
// Nodejs core module, use directly
const os = require('os');
// Number of cpu cores
const threads = os.cpus().length;
```

Install dependencies

```bash npm2yarn
npm i thread-loader -D
```

Configuration

```js title="webpack.prod.js"
// highlight-next-line
const os = require('os');
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// highlight-next-line
const TerserPlugin = require('terser-webpack-plugin');

// highlight-start
// cpu core number
const threads = os.cpus().length;
// highlight-end

// Get the Loaders for processing styles
const getStyleLoaders = (preProcessor) => {
  return [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            'postcss-preset-env', // Can solve most style compatibility issues
          ],
        },
      },
    },
    preProcessor,
  ].filter(Boolean);
};

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'), // Output is required in production mode
    filename: 'static/js/main.js', // Output js files to the static/js directory
    clean: true,
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            // Used to match files ending with .css
            test: /\.css$/,
            // The order of Loader execution in the use array is from right to left
            use: getStyleLoaders(),
          },
          {
            test: /\.less$/,
            use: getStyleLoaders('less-loader'),
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoaders('sass-loader'),
          },
          {
            test: /\.styl$/,
            use: getStyleLoaders('stylus-loader'),
          },
          {
            test: /\.(png|jpe?g|gif|webp)$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // Images smaller than 10kb will be processed with base64
              },
            },
            generator: {
              // Output the image file to the static/imgs directory
              // Name the image file [hash:8][ext][query]
              // [hash:8]: The hash value is 8 bits
              // [ext]: Use the previous file extension
              // [query]: Add the previous query parameter
              filename: 'static/imgs/[hash:8][ext][query]',
            },
          },
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
            generator: {
              filename: 'static/media/[hash:8][ext][query]',
            },
          },
          {
            test: /\.js$/,
            // exclude: /node_modules/, // exclude node_modules code from compilation
            include: path.resolve(__dirname, '../src'), // can also be used to include
            // highlight-start
            use: [
              {
                loader: 'thread-loader', // open multiple processes
                options: {
                  workers: threads, // number
                },
              },
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true, // open babel compilation cache
                },
              },
            ],
            // highlight-end
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // specify the root directory of the check file
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules', // default value
      cache: true, // open cache
      // cache directory
      cacheLocation: path.resolve(
        __dirname,
        '../node_modules/.cache/.eslintcache'
      ),
      // highlight-next-line
      threads, // open multi-process
    }),
    new HtmlWebpackPlugin({
      // create a file with public/index.html as template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the generated js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // extract css into a separate file
    new MiniCssExtractPlugin({
      // define the output file name and directory
      filename: 'static/css/main.css',
    }),
    // css compression
    // highlight-next-line
    // new CssMinimizerPlugin(),
  ],
  // highlight-start
  optimization: {
    minimize: true,
    minimizer: [
      // CSS compression can also be written to optimization.minimizer, the effect is the same
      new CssMinimizerPlugin(),
      // When the production mode will open TerserPlugin by default, but we need to make other configurations, we have to rewrite
      new TerserPlugin({
        parallel: threads, // Open multi-process
      }),
    ],
  },
  // highlight-end
  // devServer: {
  // host: "localhost", // Start server domain name
  // port: "3000", // Start server port number
  // open: true, // Whether to automatically open the browser
  // },
  mode: 'production',
  devtool: 'source-map',
};
```

We currently have very little content packaged, so because of the startup process overhead, using multi-process packaging will actually significantly increase our packaging time.
