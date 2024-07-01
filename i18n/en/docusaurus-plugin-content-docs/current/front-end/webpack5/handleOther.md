---
sidebar_position: 8
slug: handle-Other
title: Handle fonts, icons, audio, video and other resources
tags:
  [
    Webpack,
    packaging tool,
    front-end engineering,
    fonts,
    icons,
    audio,
    video and other resources,
  ]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - fonts, icons, audio, video and other resources
---

In actual development, we often use fonts, icons, audio, video and other resources. How does Webpack handle font icon resources? The following takes fonts as an example to introduce how Webpack handles other resources.

## Download font icon files

- There are too many font icon libraries. I will take [Alibaba vector icon library](https://www.iconfont.cn/) as an example

- Select the icons you want and add them to the shopping cart, and download them locally

## Add font icon resources

- src/fonts/AlimamaDaoLiTi.ttf
- src/fonts/AlimamaDaoLiTi.woff
- src/fonts/AlimamaDaoLiTi.woff2

## Introduce font icon resources

```css title="src/css/index.css"
/* highlight-start */
@font-face {
  font-family: 'AlimamaDaoLiTi';
  src: url('../fonts/AlimamaDaoLiTi.ttf');
}
@font-face {
  font-family: 'AlimamaDaoLiTi';
  src: url('../fonts/AlimamaDaoLiTi.woff');
}
@font-face {
  font-family: 'AlimamaDaoLiTi';
  src: url('../fonts/AlimamaDaoLiTi.woff2');
}

* {
  font-family: 'AlimamaDaoLiTi';
}
/* highlight-end */
.box1 {
  width: 100px;
  height: 100px;
  background-color: green;
}
```

## Configuration

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/main.js', // Output js files to static/js Directory
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
      // highlight-start
      {
        test: /\.(ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[hash:8][ext][query]',
        },
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

The difference between `type: "asset/resource"` and `type: "asset"`:

- `type: "asset/resource"` is equivalent to `file-loader`, converting files into resources that Webpack can recognize, and not processing other things

- `type: "asset"` is equivalent to `url-loader`, converting files into resources that Webpack can recognize, and resources smaller than a certain size will be processed into data URI format

If you need to process other resources such as audio and video, you can configure them in the same way.
For example, audio and video processing can be configured as follows:

```js title="webpack.config.js"
const path = require('path');

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
        // highlight-next-line
        test: /\.(ttf|woff2?|map4|map3|avi)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[hash:8][ext][query]',
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

Open the index.html page to view the effect

![Effect map](https://tecent-oss-shanghai.eaveluo.com/img/202406271830231.png?imageSlim)
