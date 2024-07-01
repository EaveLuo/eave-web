---
sidebar_position: 12
slug: automation
title: Automatic compilation using devServer
tags: [Webpack, packaging tool, front-end engineering, automation, devServer]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - automation
  - devServer
---

Every time you finish writing code, you need to manually enter instructions to compile the code. It's too troublesome. We hope everything will be automated.

## Install dependencies

```bash npm2yarn
npm i webpack-dev-server -D
```

## Configuration

```js title="webpack.config.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/main.js', // Output js files to the static/js directory
    clean: true, // Automatically clear the last package directory resources
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
        exclude: /node_modules/, // exclude node_modules code from compilation
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, 'src'),
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the packaged generated js and other resources
      template: path.resolve(__dirname, 'public/index.html'),
    }),
  ],
  // highlight-start
  // Development server
  devServer: {
    host: 'localhost', // Start server domain name
    port: '3000', // Start server port number
    open: true, // Whether to automatically open the browser
  },
  // highlight-end
  mode: 'development',
};
```

## Run command

```bash
npx webpack serve
```

**Note that the run command has changed**

And when you use the development server, all the code will be compiled and packaged in memory and will not be output to the dist directory.

During development, we only care about whether the code can run and have an effect. As for what the code is compiled into, we don't need to know.
