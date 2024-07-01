---
sidebar_position: 14
slug: optimize-css
title: Optimize CSS processing
tags: [Webpack, packaging tool, front-end engineering, CSS]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - CSS
---

There are still many areas that can be optimized for CSS processing. The following will introduce extracting CSS into separate files, CSS compatibility processing, CSS compression, etc.

## Extract CSS into separate files

CSS files are currently packaged into js files. When js files are loaded, a style tag will be created to generate styles.

This will cause screen flashing for websites, which is not a good user experience.

We should have separate CSS files and load them through link tags for better performance.

### Install dependencies

```bash npm2yarn
npm i mini-css-extract-plugin -D
```

### Configuration

```js title="webpack.prod.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// highlight-next-line
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'), // Output required for production mode
    filename: 'static/js/main.js', // Output js files to the static/js directory
    clean: true,
  },
  module: {
    rules: [
      {
        // Used to match files ending with .css
        test: /\.css$/,
        // The order of loader execution in the use array is from right to left
        // highlight-next-line
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.less$/,
        // highlight-next-line
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
      },
      {
        test: /\.s[ac]ss$/,
        // highlight-next-line
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.styl$/,
        // highlight-next-line
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
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
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the generated js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // highlight-start
    // Extract CSS into a separate file
    new MiniCssExtractPlugin({
      // Define output file name and directory
      filename: 'static/css/main.css',
    }),
    // highlight-end
  ],
  // devServer: {
  // host: "localhost", // Start server domain name
  // port: "3000", // Start server port number
  // open: true, // Whether to automatically open the browser
  // },
  mode: 'production',
};
```

### Run command

```bash npm2yarn
npm run build
```

### Effect

- Before configuration
  ![Effect image before processing](https://tecent-oss-shanghai.eaveluo.com/img/202406281643856.png?imageSlim)
- After configuration
  ![Effect image after processing](https://tecent-oss-shanghai.eaveluo.com/img/202406281644622.png?imageSlim)

## CSS compatibility processing

Not only JS has style compatibility issues, but CSS also has compatibility issues. Here we use the current mainstream solution `PostCSS` to solve it.

### Install dependencies

```bash npm2yarn
npm i postcss-loader postcss postcss-preset-env -D
```

### Configuration

```js title="webpack.prod.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'), // Output required for production mode
    filename: 'static/js/main.js', // Output js files to the static/js directory
    clean: true,
  },
  module: {
    rules: [
      {
        // Used to match files ending with .css
        test: /\.css$/,
        // The order of loader execution in the use array is from right to left
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          // highlight-start
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
          // highlight-end
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          // highlight-start
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'postcss-preset-env', // can solve most style compatibility issues
                ],
              },
            },
          },
          // highlight-end
          'less-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          // highlight-start
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
          // highlight-end
          'sass-loader',
        ],
      },
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          // highlight-start
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
          // highlight-end
          'stylus-loader',
        ],
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
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two characteristics: 1. The content is consistent with the source file 2. Automatically introduce the packaged generated js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // Extract css into a separate file
    new MiniCssExtractPlugin({
      // Define the output file name and directory
      filename: 'static/css/main.css',
    }),
  ],
  // devServer: {
  // host: "localhost", // Start server domain name
  // port: "3000", // Start server port number
  // open: true, // Whether to automatically open the browser
  // },
  mode: 'production',
};
```

### Control compatibility

We can add `browserslist` to the `package.json` file to control the degree of style compatibility.

```json title="package.json"
{
  // Others omitted
  "browserslist": ["ie >= 8"]
}
```

To know more about `browserslist` configuration, check out the [browserslist document](https://github.com/browserslist/browserslist)

The above is set to compatible browsers ie8 and above in order to test compatibility.

In actual development, we generally do not consider old versions of browsers, so we can set it like this:

```json title="package.json"
{
  // Other omissions
  "browserslist": ["last 2 version", "> 1%", "not dead"]
}
```

### Merge configuration

```js title="webpack.prod.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// highlight-start
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
// highlight-end

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
        // Used to match files ending with .css
        test: /\.css$/,
        // The order of loader execution in the use array is from right to left
        // highlight-next-line
        use: getStyleLoaders(),
      },
      {
        test: /\.less$/,
        // highligt-next-line
        use: getStyleLoaders('less-loader'),
      },
      {
        test: /\.s[ac]ss$/,
        // highligt-next-line
        use: getStyleLoaders('sass-loader'),
      },
      {
        test: /\.styl$/,
        // highligt-next-line
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
          // Output the image file to static/imgs directory
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
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // Create a file with public/index.html as the template
      // The new html file has two features: 1. The content is consistent with the source file 2. Automatically import the packaged js and other resources
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // Extract CSS into a separate file
    new MiniCssExtractPlugin({
      // Define output file name and directory
      filename: 'static/css/main.css',
    }),
  ],
  // devServer: {
  // host: "localhost", // Start server domain name
  // port: "3000", // Start server port number
  // open: true, // Whether to automatically open the browser
  // },
  mode: 'production',
};
```

### Run command

```bash npm2yarn
npm run build
```

## CSS compression

CSS compression can reduce file size and increase website loading speed.

### Install dependencies

```bash npm2yarn
npm i css-minimizer-webpack-plugin -D
```

### Configuration

```js title="webpack.prod.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// highlight-next-line
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

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
  },
  plugins: [
    new ESLintWebpackPlugin({
      // Specify the root directory of the check file
      context: path.resolve(__dirname, '../src'),
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
    // highlight-start
    // CSS compression
    new CssMinimizerPlugin(),
    // highlight-end
  ],
  // devServer: {
  // host: "localhost", // Start server domain name
  // port: "3000", // Start server port number
  // open: true, // Whether to automatically open the browser
  // },
  mode: 'production',
};
```

### Run command

```bash npm2yarn
npm run build
```

### Effect

- Before configuration
  ![Effect image before processing](https://tecent-oss-shanghai.eaveluo.com/img/202406281644622.png?imageSlim)

- After configuration
  ![Effect image after processing](https://tecent-oss-shanghai.eaveluo.com/img/202406281653259.png?imageSlim)
