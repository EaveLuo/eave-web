---
sidebar_position: 7
slug: auto-clean
title: Automatically clear the last packaged resources
tags: [Webpack, packaging tool, front-end engineering]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - Automatically clear the previous output directory
---

In the previous processing, we need to manually delete the last packaged resources if we want to see some effects, but this is obviously not convenient enough, so Webpack provides the function of automatically clearing the last packaged resources.

## Configuration

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/main.js',
    // highlight-next-line
    clean: true, // Automatically clear the last package directory resources
  },
  module: {
    rules: [
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
            maxSize: 40 * 1024, // Images smaller than 40kb will be processed with base64
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
    ],
  },
  plugins: [],
  mode: 'development',
};
```

## Run command

```bash
npx webpack
```

Observe the dist directory resources
