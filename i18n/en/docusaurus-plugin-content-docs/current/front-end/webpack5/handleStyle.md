---
sidebar_position: 4
slug: handle-style
title: Processing style resources
tags:
  [
    Webpack,
    packaging tool,
    front-end engineering,
    processing style resources,
    CSS,
    Less,
    Sass,
    Stylus,
  ]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - processing style resources
  - CSS Loader
  - Less Loader
  - Sass Loader
  - Stylus Loader
---

Webpack itself cannot recognize style resources and needs to use Loader to parse style resources. You should first find the corresponding Loader from [Webpack official Loader document](https://www.webpackjs.com/loaders/). If you can't find it, you can search and query from the community or GitHub.

## Process CSS resources

Two Loaders are needed:

- `css-loader`: compile CSS files into modules recognized by Webpack

- `style-loader`: dynamically create a Style tag and put the CSS module content into it

Installation:

```bash npm2yarn
npm i css-loader style-loader -D
```

Append the following highlighted content to the configuration file:

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      // highlight-start
      {
        // used to match files ending with .css
        test: /\.css$/,
        // Loader in the use array The execution order is from right to left
        use: ['style-loader', 'css-loader'],
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

At this point, the configuration is complete and Webpack can process CSS files correctly. Create a CSS file and import it into the JS file according to the following example, and repackage it to show the effect.

```css title="src/css/index.css"
.box1 {
  width: 100px;
  height: 100px;
  background-color: pink;
}
```

```js title="src/main.js"
import count from './js/count';
import sum from './js/sum';
// highlight-start
// Import CSS resources, Webpack will package them
import './css/index.css';
// highlight-end

console.log(count(2, 1));
console.log(sum(1, 2, 3, 4));
```

```html title="public/index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack5</title>
    <!-- Import the packaged js file to see the effect -->
    <script src="../dist/main.js"></script>
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- Prepare a DOM container with styles -->
    <div class="box1"></div>
  </body>
</html>
```

Run command

```bash
npx webpack
```

Open the index.html page to see the effect

![Effect diagram](https://tecent-oss-shanghai.eaveluo.com/img/202406271538289.png?imageSlim)

## Process Less resources

You need to use less-loader to compile Less files into CSS files.

Installation:

```bash npm2yarn
npm i less-loader -D
```

Append the following highlighted content to the configuration file. \*\*Note! Since these loaders only compile style files into CSS files, the CSS configuration cannot be deleted or changed. The execution order here is from top to bottom:

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        // Used to match files ending with .css
        test: /\.css$/,
        // The order of loader execution in the use array is from right to left
        use: ['style-loader', 'css-loader'],
      },
      // highlight-start
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

Now that it is configured, Webpack can process Less files correctly. Create a Less file and import it into the JS file according to the following example, and repackage it to show the effect.

```less title="src/less/index.less"
.box2 {
  width: 100px;
  height: 100px;
  background-color: deeppink;
}
```

```js title="src/main.js"
import count from './js/count';
import sum from './js/sum';
// Import resources, Webpack will package them
import './css/index.css';
// highlight-next-line
import './less/index.less';

console.log(count(2, 1));
console.log(sum(1, 2, 3, 4));
```

```html title="public/index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack5</title>
    <!-- Import the packaged js file to see the effect -->
    <script src="../dist/main.js"></script>
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- Prepare a DOM container using styles -->
    <div class="box1"></div>
    <!-- highlight-start -->
    <!-- Prepare a second DOM container using styles -->
    <div class="box2"></div>
    <!-- highlight-end -->
  </body>
</html>
```

Run command

```bash
npx webpack
```

Open index.html Page viewing effect

![Effect image](https://tecent-oss-shanghai.eaveluo.com/img/202406271601303.png?imageSlim)

## Process Sass and Scss resources

You need to use sass-loader to compile sass and scss files into CSS files. Since `sass-loader` depends on `sass` for compilation, you need to download the `sass` package.

Installation:

```bash npm2yarn
npm i sass-loader sass -D
```

Append the following highlighted content to the configuration file. \*\*Note! Since these loaders only compile style files into CSS files, the CSS configuration cannot be deleted or changed. The execution order here is from top to bottom:

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
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
      // highlight-start
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

Now it is configured, Webpack can process Sass files correctly. Create Sass and Scss files according to the following example and import them into JS file, and repackage to show the effect.

```sass title="src/sass/index.sass"
.box3
width: 100px
height: 100px
background-color: hotpink
```

```scss title="src/sass/index.scss"
.box4 {
  width: 100px;
  height: 100px;
  background-color: lightpink;
}
```

```js title="src/main.js"
import count from './js/count';
import sum from './js/sum';
// Import resources, Webpack will package them
import './css/index.css';
import './less/index.less';
// highlight-start
import './sass/index.sass';
import './sass/index.scss';
// highlight-end

console.log(count(2, 1));
console.log(sum(1, 2, 3, 4));
```

```html title="public/index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack5</title>
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <div class="box1"></div>
    <div class="box2"></div>
    <!-- highlight-start -->
    <!-- Prepare the third and fourth DOM containers for using styles -->
    <div class="box3"></div>
    <div class="box4"></div>
    <!-- highlight-end -->
    <script src="../dist/main.js"></script>
  </body>
</html>
```

Run command

```bash
npx webpack
```

Open the index.html page to view the effect

![Effect image](https://tecent-oss-shanghai.eaveluo.com/img/202406271617873.png?imageSlim)

## Process Stylus resources

Stylus-loader is needed to compile Stylus files into CSS files.

Install:

```bash npm2yarn
npm i stylus-loader -D
```

Append the following highlighted content to the configuration file. \*\*Note! Since these loaders only compile style files into CSS files, the CSS configuration cannot be deleted or changed. The execution order here is from top to bottom:

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
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
      // highlight-start
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

Now it is configured, Webpack can handle Stylus files correctly. Create a Stylus file and import it into the JS file according to the following example, and repackage it to show the effect.

```sass title="src/styl/index.styl"
.box5
width 100px
height 100px
background-color pink
```

```js title="src/main.js"
import { add } from './math';
import count from './js/count';
import sum from './js/sum';
// Import resources, Webpack will package them
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './sass/index.scss';
// highlight-next-line
import './styl/index.styl';

console.log(count(2, 1));
console.log(sum(1, 2, 3, 4));
```

```html title="public/index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack5</title>
    <!-- Import the packaged js file to see the effect -->
    <script src="../dist/main.js"></script>
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- Prepare a DOM container with style -->
    <div class="box1"></div>
    <!-- Prepare a second DOM container with style -->
    <div class="box2"></div>
    <div class="box3"></div>
    <div class="box4"></div>
    <!-- highlight-start -->
    <!-- Prepare the fifth DOM container using styles -->
    <div class="box5"></div>
    <!-- highlight-end -->
  </body>
</html>
```

Run command

```bash
npx webpack
```

Open the index.html page to view the effect

![Effect image](https://tecent-oss-shanghai.eaveluo.com/img/202406271649337.png?imageSlim)
