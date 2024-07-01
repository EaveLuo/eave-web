---
sidebar_position: 11
slug: handle-html
title: Handle HTML files
tags: [Webpack, Packaging tools, Front-end engineering, HTML]
keywords:
  - Webpack
  - Packaging tools
  - Front-end engineering
  - HTML
---

html-webpack-plugin greatly simplifies the manual management of HTML files by automatically generating HTML files. The plugin automatically inserts the packaged resources (such as JS, CSS files) into the generated HTML file based on the output of Webpack, and can generate the final HTML file based on the template file.

## Main functions and effects

- **Automatically generate HTML files**: html-webpack-plugin can automatically generate HTML files and automatically insert the resource files (such as JavaScript, CSS) packaged by Webpack into the generated HTML file. This means that there is no need to manually add `<script>` and `<link>` tags in the HTML file.
- **Support template files**: You can specify an HTML template file (such as `ejs`, `pug`, `handlebars`), and the plugin will generate the final HTML file based on the template file and insert the packaged resource file.
- **Automatic injection of resource files**: The plugin will automatically add the packaged JavaScript and CSS files to the `<head>` or `<body>` tags of the generated HTML file to ensure that the page loads the required resources correctly.
- **Resource management**: In a production environment, the generated file name usually contains a hash value for cache control. html-webpack-plugin can automatically update the referenced resource file name to avoid cache problems.
- **Multi-page application support**: You can add multiple html-webpack-plugin instances in the Webpack configuration to generate multiple HTML files, which is suitable for multi-page applications.

## Install dependencies

```bash npm2yarn
npm i html-webpack-plugin -D
```

## Configuration

```js title="webpack.config.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
// highlight-next-line
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
      context: path.resolve(__dirname, 'src'),
    }),
    // highlight-start
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the packaged generated js and other resources
      template: path.resolve(__dirname, 'public/index.html'),
    }),
    // highlight-end
  ],
  mode: 'development',
};
```

Remove the imported js file, because HtmlWebpackPlugin will automatically introduce it.

```html title="public/index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack5</title>
    <!-- highlight-start -->
    <!-- Remove the imported js file, HtmlWebpackPlugin automatically imports the packaged generated js and other resources -->
    <!-- <script src="../dist/static/js/main.js"></script> -->
    <!-- highlight-end -->
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- Prepare a DOM container using styles -->
    <div class="box1"></div>
    <!-- Prepare a second DOM container using styles -->
    <div class="box2"></div>
    <!-- Prepare the third and fourth DOM containers using styles -->
    <div class="box3"></div>
    <div class="box4"></div>
    <!-- Prepare the fifth DOM container using styles -->
    <div class="box5"></div>
  </body>
</html>
```

## Run command

```bash
npx webpack
```

At this time, the dist directory will output an index.html file.

![Effect image](https://tecent-oss-shanghai.eaveluo.com/img/202406281441345.png?imageSlim)
