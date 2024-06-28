---
    sidebar_position: 11
    slug: handle-html
    title: 处理 HTML 文件
    tags: [Webpack, 打包工具, 前端工程化, HTML]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - HTML
---

html-webpack-plugin 通过自动生成 HTML 文件的方式，极大简化了开发者手动管理 HTML 文件的工作。该插件会根据 Webpack 的输出，自动将打包后的资源（如 JS、CSS 文件）插入到生成的 HTML 文件中，并且可以根据模板文件生成最终的 HTML 文件。

## 主要功能和作用

- **自动生成 HTML 文件**：html-webpack-plugin 可以自动生成 HTML 文件，并将 Webpack 打包后的资源文件（如 JavaScript、CSS）自动插入到生成的 HTML 文件中。这意味着不需要手动在 HTML 文件中添加 `<script>` 和 `<link>` 标签。
- **支持模板文件**：可以指定一个 HTML 模板文件（例如 `ejs` 、`pug` 、`handlebars` ），插件会根据该模板文件生成最终的 HTML 文件，并插入打包后的资源文件。
- **自动注入资源文件**：插件会自动将打包后的 JavaScript 和 CSS 文件添加到生成的 HTML 文件的 `<head>` 或 `<body>` 标签中，确保页面正确加载所需的资源。
- **资源管理**：在生产环境中，生成的文件名通常包含哈希值以便于缓存控制，html-webpack-plugin 能够自动更新引用的资源文件名，从而避免缓存问题。
- **多页应用支持**：可以在 Webpack 配置中添加多个 html-webpack-plugin 实例，生成多个 HTML 文件，适用于多页应用。

## 安装依赖

```bash npm2yarn
npm i html-webpack-plugin -D
```

## 配置

```js title="webpack.config.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
// highlight-next-line
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static/js/main.js', // 将 js 文件输出到 static/js 目录中
    clean: true, // 自动将上次打包目录资源清空
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
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
          },
        },
        generator: {
          // 将图片文件输出到 static/imgs 目录中
          // 将图片文件命名 [hash:8][ext][query]
          // [hash:8]: hash值取8位
          // [ext]: 使用之前的文件扩展名
          // [query]: 添加之前的query参数
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
        exclude: /node_modules/, // 排除node_modules代码不编译
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录
      context: path.resolve(__dirname, 'src'),
    }),
    // highlight-start
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, 'public/index.html'),
    }),
    // highlight-end
  ],
  mode: 'development',
};
```

去掉引入的 js 文件，因为 HtmlWebpackPlugin 会自动引入。

```html title="public/index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>webpack5</title>
    <!-- highlight-start -->
    <!-- 去掉引入的 js 文件，HtmlWebpackPlugin自动引入打包生成的js等资源 -->
    <!-- <script src="../dist/static/js/main.js"></script> -->
    <!-- highlight-end -->
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- 准备一个使用样式的 DOM 容器 -->
    <div class="box1"></div>
    <!-- 准备第二个使用样式的 DOM 容器 -->
    <div class="box2"></div>
    <!-- 准备第三四个使用样式的 DOM 容器 -->
    <div class="box3"></div>
    <div class="box4"></div>
    <!-- 准备第五个使用样式的 DOM 容器 -->
    <div class="box5"></div>
  </body>
</html>
```

## 运行指令

```bash
npx webpack
```

此时 dist 目录就会输出一个 index.html 文件。

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406281441345.png?imageSlim)
