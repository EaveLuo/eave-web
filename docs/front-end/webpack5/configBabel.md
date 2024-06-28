---
    sidebar_position: 10
    slug: config-babel
    title: 配置代码兼容性处理工具 Babel
    tags: [Webpack, 打包工具, 前端工程化, 兼容性, Babel]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 兼容性
    - Babel
---

Babel 是一个广泛使用的 JavaScript 编译器，主要用于将现代 JavaScript 代码（包括 ES6+）转换为向后兼容的版本，使其可以在所有浏览器或环境中运行。

## 主要功能和作用

- **代码转换**：将最新版本的 JavaScript 代码（包括 ES6、ES7 等）转换为 ES5 版本，使代码能够在旧版浏览器中运行。
- **插件系统**：Babel 通过插件的形式实现对不同 JavaScript 特性的支持，如箭头函数、类、模板字符串等。用户可以根据项目需求选择相应的插件进行配置。
- **Polyfill**：对于某些新的全局变量（如 Promise、Symbol），Babel 可以通过引入 polyfill 来实现支持。
- **源码转换**：除了语法转换，Babel 还可以进行源码级别的转换，如将 TypeScript 代码转换为 JavaScript，将 JSX 转换为普通的 JavaScript 代码。
- **构建工具集成**：Babel 可以很容易地与各种构建工具（如 Webpack、Gulp、Rollup 等）集成，提供灵活的构建和打包方案。

## 配置文件

配置文件由很多种写法：

- `babel.config.*`：新建文件，位于项目根目录
  - `babel.config.js`
  - `babel.config.json`
- `.babelrc.*`：新建文件，位于项目根目录
  - `.babelrc`
  - `.babelrc.js`
  - `.babelrc.json`
- `package.json` 中 `babel`：不需要创建文件，在原有文件基础上写

Babel 会查找和自动读取它们，所以以上配置文件只需要存在一个即可

## 具体配置

我们以 `babel.config.js` 配置文件为例：

```js title="babel.config.js"
module.exports = {
  // 预设
  presets: [],
};
```

#### presets 预设

简单理解，就是一组 Babel 插件, 扩展 Babel 功能，例如：

- `@babel/preset-env`: 一个智能预设，允许您使用最新的 JavaScript。
- `@babel/preset-react`：一个用来编译 React jsx 语法的预设。
- `@babel/preset-typescript`：一个用来编译 TypeScript 语法的预设。

## 在 Webpack 中使用

### 安装依赖

```bash npm2yarn
npm i babel-loader @babel/core @babel/preset-env -D
```

### 修改 Babel 配置文件

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
      // highlight-start
      {
        test: /\.js$/,
        exclude: /node_modules/, // 排除node_modules代码不编译
        loader: 'babel-loader',
      },
      // highlight-end
    ],
  },
  plugins: [
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录
      context: path.resolve(__dirname, 'src'),
    }),
  ],
  mode: 'development',
};
```

此时就可以在 Webpack 中使用 Babel 进行代码兼容性处理代码了，下列示例代码来检验 Babel 是否生效：

```js title="src/main.js"
// import count from './js/count';
// import sum from './js/sum';
// 引入资源，Webpack才会对其打包
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './sass/index.scss';
import './styl/index.styl';

// highlight-start
// 测试箭头函数
const pow = (x, y) => x ** y;

console.log(pow(2, 3)); // 8
// highlight-end
```

### 运行指令

```bash
npx webpack
```

打开打包后的 `dist/static/js/main.js` 文件查看，会发现箭头函数等 ES6 语法已经转换了：

转换前：

![转换前效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406281203715.png?imageSlim)

转换后：

![转换后效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406281204681.png?imageSlim)
