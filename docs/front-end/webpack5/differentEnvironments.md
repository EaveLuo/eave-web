---
    sidebar_position: 13
    slug: different-environments
    title: 分别搭建开发环境和生产环境
    tags: [Webpack, 打包工具, 前端工程化, 开发环境, 生产环境]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 开发环境
    - 生产环境
---

在实际开发中，我们往往会有开发环境和生产环境，两者的配置会有差异。本文将介绍 Webpack 如何分别搭建开发环境和生产环境。

## 开发模式介绍

开发模式顾名思义就是我们开发代码时使用的模式。

这个模式下我们主要做两件事：

- **编译代码，使浏览器能识别运行**

  开发时我们有样式资源、字体图标、图片资源、html 资源等，webpack 默认都不能处理这些资源，所以我们要加载配置来编译这些资源。

- **代码质量检查，树立代码规范**

  提前检查代码的一些隐患，让代码运行时能更加健壮。

  提前检查代码规范和格式，统一团队编码风格，让代码更优雅美观。

## 生产模式介绍

生产模式是开发完成代码后，我们需要得到代码将来部署上线。

这个模式下我们主要对代码进行优化，让其运行性能更好。

优化主要从两个角度出发:

- **优化代码运行性能**
- **优化代码打包速度**

## 文件目录结构

```bash
├── webpack-test (项目根目录)
    ├── config (Webpack配置文件目录)
    │    ├── webpack.dev.js(开发模式配置文件)
    │    └── webpack.prod.js(生产模式配置文件)
    ├── node_modules (依赖存放目录)
    ├── src (项目源码目录，除了html其他都在src里面)
    │    └── 略
    ├── public (项目html文件)
    │    └── index.html
    ├── .eslintrc.js(Eslint配置文件)
    ├── babel.config.js(Babel配置文件)
    └── package.json (包的依赖管理配置文件)
```

## 开发环境配置

因为文件目录变了，所以所有绝对路径需要回退一层目录才能找到对应的文件

```js title="webpack.dev.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    // highlight-next-line
    path: undefined, // 开发模式没有输出，不需要指定输出目录
    filename: 'static/js/main.js', // 将 js 文件输出到 static/js 目录中
    // highlight-next-line
    // clean: true, // 开发模式没有输出，不需要清空输出结果
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
      // highlight-next-line
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      // highlight-next-line
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  // 其他省略
  devServer: {
    host: 'localhost', // 启动服务器域名
    port: '3000', // 启动服务器端口号
    open: true, // 是否自动打开浏览器
  },
  mode: 'development',
};
```

运行开发模式的指令：

```bash
npx webpack serve --config ./config/webpack.dev.js
```

## 生产环境配置

```js title="webpack.prod.js"
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    // highlight-next-line
    path: path.resolve(__dirname, '../dist'), // 生产模式需要输出
    filename: 'static/js/main.js', // 将 js 文件输出到 static/js 目录中
    clean: true,
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
      context: path.resolve(__dirname, '../src'),
    }),
    new HtmlWebpackPlugin({
      // 以 public/index.html 为模板创建文件
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  // highlight-start
  // devServer: {
  //   host: "localhost", // 启动服务器域名
  //   port: "3000", // 启动服务器端口号
  //   open: true, // 是否自动打开浏览器
  // },
  // highlight-end
  mode: 'production',
};
```

运行生产模式的指令：

```bash
npx webpack --config ./config/webpack.prod.js
```

## 配置运行指令

为了方便运行不同模式的指令，我们将指令定义在 package.json 中 scripts 里面

```json title="package.json"
{
  // 其他省略
  "scripts": {
    "start": "npm run dev",
    "dev": "npx webpack serve --config ./config/webpack.dev.js",
    "build": "npx webpack --config ./config/webpack.prod.js"
  }
}
```

以后启动指令：

- 开发模式：`npm start` 或 `npm run dev`
- 生产模式：`npm run build`
