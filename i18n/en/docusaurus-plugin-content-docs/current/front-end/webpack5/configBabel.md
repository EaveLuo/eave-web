---
sidebar_position: 10
slug: config-babel
title: Configure code compatibility processing tool Babel
tags: [Webpack, packaging tool, front-end engineering, compatibility, Babel]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - compatibility
  - Babel
---

Babel is a widely used JavaScript compiler, mainly used to convert modern JavaScript code (including ES6+) into a backward compatible version so that it can run in all browsers or environments.

## Main functions and effects

- **Code conversion**: Convert the latest version of JavaScript code (including ES6, ES7, etc.) to ES5 version, so that the code can run in older browsers.
- **Plug-in system**: Babel implements support for different JavaScript features in the form of plug-ins, such as arrow functions, classes, template strings, etc. Users can choose the corresponding plug-in for configuration according to project requirements.
- **Polyfill**: For some new global variables (such as Promise, Symbol), Babel can support them by introducing polyfill.
- **Source code conversion**: In addition to syntax conversion, Babel can also perform source code level conversion, such as converting TypeScript code to JavaScript and converting JSX to ordinary JavaScript code.
- **Build tool integration**: Babel can be easily integrated with various build tools (such as Webpack, Gulp, Rollup, etc.), providing flexible building and packaging solutions.

## Configuration file

Configuration files can be written in many ways:

- `babel.config.*`: create a new file, located in the project root directory

- `babel.config.js`

- `babel.config.json`

- `.babelrc.*`: create a new file, located in the project root directory

- `.babelrc`

- `.babelrc.js`

- `.babelrc.json`

- `babel` in `package.json`: no need to create a file, write it based on the original file

Babel will find and read them automatically, so only one of the above configuration files needs to exist

## Specific configuration

Let's take the `babel.config.js` configuration file as an example:

```js title="babel.config.js"
module.exports = {
  // presets
  presets: [],
};
```

#### presets

Simply understand, it is a set of Babel plugins that extend Babel functions, for example:

- `@babel/preset-env`: A smart preset that allows you to use the latest JavaScript.
- `@babel/preset-react`: A preset for compiling React jsx syntax.
- `@babel/preset-typescript`: A preset for compiling TypeScript syntax.

## Use in Webpack

### Install dependencies

```bash npm2yarn
npm i babel-loader @babel/core @babel/preset-env -D
```

### Modify Babel configuration file

```js title="babel.config.js"
module.exports = {
  presets: ['@babel/preset-env'],
};
```

```js title="webpack.config.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

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
      // highlight-start
      {
        test: /\.js$/,
        exclude: /node_modules/, // exclude node_modules code from compilation
        loader: 'babel-loader',
      },
      // highlight-end
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // specify the root directory of the check file
      context: path.resolve(__dirname, 'src'),
    }),
  ],
  mode: 'development',
};
```

At this point, you can use Babel in Webpack to process the code for code compatibility. The following sample code verifies whether Babel is effective:

```js title="src/main.js"
// import count from './js/count';
// import sum from './js/sum';
// Import resources, Webpack will package them
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './sass/index.scss';
import './styl/index.styl';

// highlight-start
// Test arrow function
const pow = (x, y) => x ** y;

console.log(pow(2, 3)); // 8
// highlight-end
```

### Run command

```bash
npx webpack
```

Open the packaged `dist/static/js/main.js` file and you will find arrow functions and other ES6 The syntax has been converted:

Before conversion:

![Effect image before conversion](https://tecent-oss-shanghai.eaveluo.com/img/202406281203715.png?imageSlim)

After conversion:

![Effect image after conversion](https://tecent-oss-shanghai.eaveluo.com/img/202406281204681.png?imageSlim)
