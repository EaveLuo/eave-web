---
sidebar_position: 17
slug: reduce-volume
title: Reduce code size
tags:
  [
    Webpack,
    Bundling tool,
    Front-end engineering,
    Tree Shaking,
    Babel,
    Image compression,
    Performance optimization,
  ]
keywords:
  - Webpack
  - Bundling tool
  - Front-end engineering
  - Tree Shaking
  - Babel
  - Image compression
  - Performance optimization
---

In actual development, the project size will become larger and larger, and the amount of code will also increase. At this time, we need to compress the code and reduce the size.

## Tree Shaking

`Tree Shaking` is a term that is usually used to describe the removal of unused code in JavaScript.

**Note: It depends on `ES Module`. **

### Why configure

During development, we define some tool function libraries, or reference third-party tool function libraries or component libraries.

If there is no special treatment, we will introduce the entire library when packaging, but in fact we may only use a very small part of the functions.

In this way, the entire library is packaged in, and the volume is too large.

### How to configure

Webpack has enabled this feature by default, no additional configuration is required.

## Babel

`@babel/plugin-transform-runtime`: Disables Babel's automatic runtime injection for each file, instead imports `@babel/plugin-transform-runtime` and makes all auxiliary codes referenced from here.

### Why configure

Babel inserts auxiliary code for each compiled file, making the code size too large!

Babel uses very small auxiliary code for some common methods, such as `_extend`. By default, it will be added to every file that needs it.

You can use these auxiliary codes as a separate module to avoid repeated imports.

### How to configure

Install dependencies

```
npm i @babel/plugin-transform-runtime -D
```

Configuration

```js title="webpack.prod.js"
const os = require('os');
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// Number of cpu cores
const threads = os.cpus().length;

// Get Loaders for processing styles
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
    path: path.resolve(__dirname, '../dist'), // Production mode requires output
    filename: 'static/js/main.js', // Output js files to the static/js directory
    clean: true,
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            // Used to match File ending with .css
            test: /\.css$/,
            // The order of loader execution in the use array is from right to left
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
            use: [
              {
                loader: 'thread-loader', // Enable multi-process
                options: {
                  workers: threads, // number
                },
              },
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true, // Enable babel compilation cache
                  cacheCompression: false, // Do not compress cache files
                  // highlight-next-line
                  plugins: ['@babel/plugin-transform-runtime'], // Reduce code size
                },
              },
            ],
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
      cache: true, // Enable cache
      // Cache directory
      cacheLocation: path.resolve(
        __dirname,
        '../node_modules/.cache/.eslintcache'
      ),
      threads, // Start multi-process
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the generated js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // Extract CSS into a separate file
    new MiniCssExtractPlugin({
      // Define the output file name and directory
      filename: 'static/css/main.css',
    }),
    // CSS compression
    // new CssMinimizerPlugin(),
  ],
  optimization: {
    minimizer: [
      // CSS compression can also be written to optimization.minimizer, the effect is the same
      new CssMinimizerPlugin(),
      // When in production mode, TerserPlugin will be enabled by default, but if we need to configure other things, we have to rewrite it
      new TerserPlugin({
        parallel: threads, // Enable multi-process
      }),
    ],
  },
  // devServer: {
  // host: "localhost", // Start server domain name
  // port: "3000", // Start server port number
  // open: true, // Whether to automatically open the browser
  // },
  mode: 'production',
  devtool: 'source-map',
};
```

## Image Minimizer

`image-minimizer-webpack-plugin`: A plugin for compressing images

### Why configure

If a lot of images are referenced in the project, the image size will be large and the request speed will be slow in the future.

We can compress the images to reduce the image size.

**Note: If the images in the project are all online links, then this is not necessary. Only static images in local projects need to be compressed. **

### How to configure

Installation dependencies

```bash npm2yarn
npm i image-minimizer-webpack-plugin imagemin -D
```

There are still some packages to download, and there are two modes:

- Lossless compression

Lossless compression reduces file size through efficient encoding, retains all image data, and ensures that the image quality remains unchanged. It is suitable for scenes with high requirements for image quality, such as professional photography and image processing.

```bash npm2yarn
npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo -D
```

- Lossy compression

Lossy compression reduces file size by discarding part of the image data, but it will cause the image quality to deteriorate. It is suitable for scenarios with high requirements on file size and low requirements on image quality, such as web page images.

```bash npm2yarn
npm install imagemin-gifsicle imagemin-mozjpeg imagemin-pngquant imagemin-svgo -D
```

Let's take lossless compression configuration as an example:

```js title="webpack.prod.js"
const os = require('os');
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// highlight-next-line
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

// Number of cpu cores
const threads = os.cpus().length;

// Get Loaders for processing styles
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
path: path.resolve(__dirname, '../dist'), // Production mode requires output
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
// The order of loader execution in the use array is from right to left
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
test: /\.(png|jpe?g|gif|svg)$/,
type: 'asset',
parser: {
dataUrlCondition: {
maxSize: 10 * 1024, // Images smaller than 10kb will be processed with base64
},
},
generator: {
// Output image files to the static/imgs directory
// Name the image files [hash:8][ext][query]
// [hash:8]: The hash value is 8 bits
// [ext]: Use the previous file extension
// [query]: Add the previous query parameters
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
include: path.resolve(__dirname, '../src'), // You can also use include
use: [
{
loader: 'thread-loader', // Enable multi-process
options: {
workers: threads, // Quantity
},
},
{
loader: 'babel-loader',
options: {
cacheDirectory: true, // Enable babel compilation cache
cacheCompression: false, // Do not compress cache files
plugins: ['@babel/plugin-transform-runtime'], // Reduce code size
},
},
],
},
],
},
],
},
plugins: [
new ESLintWebpackPlugin({
// Specify the root directory of the check file
context: path.resolve(__dirname, '../src'),
exclude: 'node_modules', // Default value
cache: true, // Enable cache
// Cache directory
cacheLocation: path.resolve(
__dirname,
'../node_modules/.cache/.eslintcache'
),
threads, // Enable multi-process
}),
new HtmlWebpackPlugin({
// Create a file with public/index.html as template
// The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce packaged js and other resources
template: path.resolve(__dirname, '../public/index.html'),
}),
// Extract css into a separate file
new MiniCssExtractPlugin({
// Define output file name and directory
filename: 'static/css/main.css',
}),
// CSS compression
// new CssMinimizerPlugin(),
],
optimization: {
minimizer: [
// CSS compression can also be written to optimization.minimizer, the effect is the same
new CssMinimizerPlugin(),
// When the production mode will open TerserPlugin by default, but we need to make other configurations, we have to rewrite
new TerserPlugin({
parallel: threads, // Open multiple processes
}),
// highlight-start
// Compress images
new ImageMinimizerPlugin({
minimizer: {
implementation: ImageMinimizerPlugin.imageminGenerate,
options: {
plugins: [
['gifsicle', { interlaced: true }],
['jpegtran', { progressive: true }],
['optipng', { optimizationLevel: 5 }],
[
'svgo',
{
plugins: [
'preset-default',
'prefixIds',
{
name: 'sortAttrs',
params: {
xmlnsOrder: 'alphabetical',
},
},
],
},
],
],
},
}),
// highlight-end
],
},
// devServer: {
// host: "localhost", // Start server domain name
// port: "3000", // Start server port number
// open: true, // Whether to automatically open the browser
// },
mode: 'production',
devtool: 'source-map',
};
```

Error will be reported when packaging:

```
Error: Error with 'src\images\1.jpeg': '"C:\Users\Administrator\Desktop\webpack\webpack_code\node_modules\jpegtran-bin\vendor\jpegtran.exe"'
Error with 'src\images\3.gif': spawn C:\Users\Administrator\Desktop\webpack\webpack_code\node_modules\optipng-bin\vendor\optipng.exe ENOENT
```

We need to install two files into node_modules to solve the problem:

- jpegtran.exe

Need to be copied to `node_modules\jpegtran-bin\vendor`.

> [jpegtran official website address](http://jpegclub.org/jpegtran/)

- optipng.exe

Need to be copied to `node_modules\optipng-bin\vendor`.

> [OptiPNG official website address](http://optipng.sourceforge.net/)
