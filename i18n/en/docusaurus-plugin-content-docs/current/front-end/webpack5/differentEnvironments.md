---
sidebar_position: 13
slug: different-environments
title: Build development environment and production environment separately
tags:
  [
    Webpack,
    packaging tool,
    front-end engineering,
    development environment,
    production environment,
  ]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - development environment
  - production environment
---

In actual development, we often have development environment and production environment, and the configurations of the two will be different. This article will introduce how Webpack builds development environment and production environment separately.

## Introduction to development mode

As the name suggests, the development mode is the mode we use when developing code.

In this mode, we mainly do two things:

- **Compile code so that the browser can recognize and run**

During development, we have style resources, font icons, image resources, html resources, etc. Webpack cannot process these resources by default, so we have to load configuration to compile these resources.

- **Code quality check, establish code standards**

Check some hidden dangers of the code in advance to make the code more robust when running.

Check the code standards and formats in advance, unify the team's coding style, and make the code more elegant and beautiful.

## Introduction to production mode

The production mode is that after the code is developed, we need to get the code to deploy it online in the future.

In this mode, we mainly optimize the code to make it run better.

Optimization is mainly based on two aspects:

- **Optimize code running performance**
- **Optimize code packaging speed**

## File directory structure

```bash
├── webpack-test (project root directory)
├── config (Webpack configuration file directory)
│ ├── webpack.dev.js (development mode configuration file)
│ └── webpack.prod.js (production mode configuration file)
├── node_modules (dependency storage directory)
├── src (project source code directory, except html, everything else is in src)
│ └── omitted
├── public (project html file)
│ └── index.html
├── .eslintrc.js (Eslint configuration file)
├── babel.config.js (Babel configuration file)
└── package.json (package dependency management configuration file)
```

## Development environment configuration

Because the file directory has changed, all absolute paths need to go back one level of directory to find the corresponding file

```js title="webpack.dev.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    // highlight-next-line
    path: undefined, // Development mode has no output, no need to specify output directory
    filename: 'static/js/main.js', // Output js file to static/js directory
    // highlight-next-line
    // clean: true, // Development mode has no output, no need to clear output results
  },
  module: {
    rules: [
      {
        // Used to match files ending with .css
        test: /\.css$/,
        // The order of loader execution in the use array is from right to left
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
        exclude: /node_modules/, // Exclude node_modules code from compilation
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      // highlight-next-line
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the packaged js and other resources
      // highlight-next-line
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  // Others omitted
  devServer: {
    host: 'localhost', // Start server domain name
    port: '3000', // Start server port number
    open: true, // Whether to automatically open the browser
  },
  mode: 'development',
};
```

Instructions for running development mode:

```bash
npx webpack serve --config ./config/webpack.dev.js
```

## Production environment configuration

```js title="webpack.prod.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    // highlight-next-line
    path: path.resolve(__dirname, '../dist'), // Production mode requires output
    filename: 'static/js/main.js', // Output js files to the static/js directory
    clean: true,
  },
  module: {
    rules: [
      {
        // Used to match files ending with .css
        test: /\.css$/,
        // The order of loader execution in the use array is from right to left
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
        exclude: /node_modules/, // Exclude node_modules code does not compile
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as a template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce packaged js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  // highlight-start
  // devServer: {
  // host: "localhost", // Start server domain name
  // port: "3000", // Start server port number
  // open: true, // Whether to automatically open the browser
  // },
  // highlight-end
  mode: 'production',
};
```

Instructions for running production mode:

```bash
npx webpack --config ./config/webpack.prod.js
```

## Configure running instructions

In order to facilitate running instructions in different modes, we define the instructions in scripts in package.json

```json title="package.json"
{
  // Others omitted
  "scripts": {
    "start": "npm run dev",
    "dev": "npx webpack serve --config ./config/webpack.dev.js",
    "build": "npx webpack --config ./config/webpack.prod.js"
  }
}
```

Later start instructions:

- Development mode: `npm start` or `npm run dev`
- Production mode: `npm run build`
