---
    sidebar_position: 4
    slug: handle-style
    title: 处理样式资源
    tags: [Webpack, 打包工具, 前端工程化, 处理样式资源, CSS, Less, Sass, Stylus]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 处理样式资源
    - CSS Loader
    - Less Loader
    - Sass Loader
    - Stylus Loader
---

Webpack 本身不能识别样式资源，需要借助 Loader 来解析样式资源。应优先从 [Webpack 官方 Loader 文档](https://www.webpackjs.com/loaders/) 找到对应的 Loader，如无法找到，可从社区或 GitHub 搜索查询。

## 处理 CSS 资源

需要用到两个 Loader：

- `css-loader`：将 CSS 文件编译成 Webpack 识别的模块
- `style-loader`：动态创建一个 Style 标签，将 CSS 模块内容放入其中

安装：

```bash npm2yarn
npm i css-loader style-loader -D
```

在配置文件中追加以下高亮内容：

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
        // 用来匹配 .css 结尾的文件
        test: /\.css$/,
        // use 数组里面 Loader 执行顺序是从右到左
        use: ['style-loader', 'css-loader'],
      },
      // highlight-end
    ],
  },
  plugins: [],
  mode: 'development',
};
```

此时就已经配置好了，Webpack 能正确处理 CSS 文件了。按下列例子创建 CSS 文件并引入到 JS 文件中，重新打包以展示效果。

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
// 引入 CSS 资源，Webpack才会对其打包
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
    <!-- 引入打包后的js文件，才能看到效果 -->
    <script src="../dist/main.js"></script>
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- 准备一个使用样式的 DOM 容器 -->
    <div class="box1"></div>
  </body>
</html>
```

运行指令

```bash
npx webpack
```

打开 index.html 页面查看效果

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406271538289.png?imageSlim)

## 处理 Less 资源

需要用到 less-loader 将 Less 文件编译成 CSS 文件。

安装:

```bash npm2yarn
npm i less-loader -D
```

在配置文件中追加以下高亮内容。**注意！由于这些 loader 只是将样式文件编译成 CSS 文件，所以 CSS 的配置不能删掉顺序也不能换，此处执行顺序是按下往上的**：

```js titile="webpack.config.js"
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

此时就已经配置好了，Webpack 能正确处理 Less 文件了。按下列例子创建 Less 文件并引入到 JS 文件中，重新打包以展示效果。

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
// 引入资源，Webpack才会对其打包
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
    <!-- 引入打包后的js文件，才能看到效果 -->
    <script src="../dist/main.js"></script>
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- 准备一个使用样式的 DOM 容器 -->
    <div class="box1"></div>
    <!-- highlight-start -->
    <!-- 准备第二个使用样式的 DOM 容器 -->
    <div class="box2"></div>
    <!-- highlight-end -->
  </body>
</html>
```

运行指令

```bash
npx webpack
```

打开 index.html 页面查看效果

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406271601303.png?imageSlim)

## 处理 Sass 和 Scss 资源

需要用到 sass-loader 将 sass 和 scss 文件编译成 CSS 文件。由于 `sass-loader` 依赖 `sass` 进行编译，所以需要下载 `sass` 包。

安装:

```bash npm2yarn
npm i sass-loader sass -D
```

在配置文件中追加以下高亮内容。**注意！由于这些 loader 只是将样式文件编译成 CSS 文件，所以 CSS 的配置不能删掉顺序也不能换，此处执行顺序是按下往上的**：

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

此时就已经配置好了，Webpack 能正确处理 Sass 文件了。按下列例子创建 Sass 和 Scss 文件并引入到 JS 文件中，重新打包以展示效果。

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
// 引入资源，Webpack才会对其打包
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
    <!-- 准备第三四个使用样式的 DOM 容器 -->
    <div class="box3"></div>
    <div class="box4"></div>
    <!-- highlight-end -->
    <script src="../dist/main.js"></script>
  </body>
</html>
```

运行指令

```bash
npx webpack
```

打开 index.html 页面查看效果

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406271617873.png?imageSlim)

## 处理 Stylus 资源

需要用到 stylus-loader 将 Stylus 文件编译成 CSS 文件。

安装：

```bash npm2yarn
npm i stylus-loader -D
```

在配置文件中追加以下高亮内容。**注意！由于这些 loader 只是将样式文件编译成 CSS 文件，所以 CSS 的配置不能删掉顺序也不能换，此处执行顺序是按下往上的**：

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

此时就已经配置好了，Webpack 能正确处理 Stylus 文件了。按下列例子创建 Stylus 文件并引入到 JS 文件中，重新打包以展示效果。

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
// 引入资源，Webpack才会对其打包
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
    <!-- 引入打包后的js文件，才能看到效果 -->
    <script src="../dist/main.js"></script>
  </head>
  <body>
    <h1>Hello Webpack5</h1>
    <!-- 准备一个使用样式的 DOM 容器 -->
    <div class="box1"></div>
    <!-- 准备第二个使用样式的 DOM 容器 -->
    <div class="box2"></div>
    <div class="box3"></div>
    <div class="box4"></div>
    <!-- highlight-start -->
    <!-- 准备第五个使用样式的 DOM 容器 -->
    <div class="box5"></div>
    <!-- highlight-end -->
  </body>
</html>
```

运行指令

```bash
npx webpack
```

打开 index.html 页面查看效果

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202406271649337.png?imageSlim)
