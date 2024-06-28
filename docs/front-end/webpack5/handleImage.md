---
    sidebar_position: 5
    slug: handle-images
    title: 处理图片资源
    tags: [Webpack, 打包工具, 前端工程化, 图片资源]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 图片资源
---

过去在 Webpack4 时，我们处理图片资源通过 file-loader 和 url-loader 进行处理。

现在 Webpack5 已将这两个 Loader 的功能内置到 Webpack 里，只需简单配置即可处理图片资源。

## 配置

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
        // 用来匹配 .css 结尾的文件
        test: /\.css$/,
        // use 数组里面 Loader 执行顺序是从右到左
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
      // highlight-start
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: 'asset',
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

## 添加图片资源

- src/images/1.jpeg
- src/images/2.png
- src/images/3.gif

## 使用图片资源

```less title="src/less/index.less"
.box2 {
  width: 100px;
  height: 100px;
  background-image: url('../images/1.jpeg');
  background-size: cover;
}
```

```sass title="src/sass/index.sass"
.box3
  width: 100px
  height: 100px
  background-image: url("../images/2.png")
  background-size: cover
```

```sass title="src/styl/index.styl"
.box5
  width 100px
  height 100px
  background-image url("../images/3.gif")
  background-size cover
```

## 运行指令

```bash
npx webpack
```

打开 index.html 页面查看效果

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406271708610.png?imageSlim)

## 输出资源情况

此时如果查看 `dist` 目录，会发现多了三张图片资源。

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406271707052.png?imageSlim)

因为 Webpack 会将所有打包好的资源输出到 `dist` 目录下。

样式资源没有额外输出，是因为经过 `style-loader` 处理后，样式资源被打包到 `main.js` 里。

## 对图片资源进行优化

将小于某个大小的图片转化成 data URI 形式（Base64 格式）。

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
        // 用来匹配 .css 结尾的文件
        test: /\.css$/,
        // use 数组里面 Loader 执行顺序是从右到左
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
      // highlight-start
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
          },
        },
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

- 优点：减少请求数量
- 缺点：体积变得更大

此时输出的图片文件只有两张，有一张图片以 data URI 形式内置到 JS 中。

注意：需要将上次打包生成的文件清空，再重新打包才有效果。
