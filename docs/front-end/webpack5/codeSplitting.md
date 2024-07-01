---
    sidebar_position: 18
    slug: code-splitting
    title: 配置代码分割
    tags: [Webpack, 打包工具, 前端工程化, 性能优化]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 性能优化
    - 代码分割
---

在打包代码时，所有 JS 文件会被打包到一个文件中，导致体积过大。如果我们只需要渲染首页，就应该只加载首页的 JS 文件，而不加载其他文件。因此，我们需要对打包生成的文件进行代码分割，生成多个 JS 文件。这样一来，渲染哪个页面就只加载对应的 JS 文件，减少加载资源，提高速度。

:::info

代码分割主要做了两件事：

- 分割文件：将打包生成的文件进行分割，生成多个 js 文件。
- 按需加载：需要哪个文件就加载哪个文件。

:::

常用的代码分割方法有三种：

- 入口起点：使用 `entry` 配置手动地分割代码，将入口文件和其他文件分割，入口文件负责渲染首屏内容，其他文件负责渲染非首屏内容。
- 防止重复：使用 `入口依赖` 或者 `SplitChunksPlugin` 去重和分割 chunk。
- 动态导入：通过模块的内联函数调用分割代码。

## 入口起点-多入口配置

入口起点是 Webpack 最基本的分割代码的方法。通过配置 `entry` 属性，可以指定一个或多个入口文件，Webpack 会自动地将这些文件打包到一个文件中。

:::tip

为了保证尽可能的体现代码分割的效果，此处示例代码越简单越好。

:::

### 项目初始化

```js title="webpack.config.js"
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 单入口
  // entry: './src/main.js',
  // 多入口
  entry: {
    main: './src/main.js',
    app: './src/app.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    // [name]是webpack命名规则，使用chunk的name作为输出的文件名。
    // 什么是chunk？打包的资源就是chunk，输出出去叫bundle。
    // chunk的name是啥呢？ 比如： entry中xxx: "./src/xxx.js", name就是xxx。注意是前面的xxx，和文件名无关。
    // 为什么需要这样命名呢？如果还是之前写法main.js，那么打包生成两个js文件都会叫做main.js会发生覆盖。(实际上会直接报错的)
    filename: 'js/[name].bundle.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  mode: 'production',
};
```

```js title="src/math.js"
export function sum(...args) {
  return args.reduce((acc, val) => acc + val, 0);
}
```

```js title="src/main.js"
import { sum } from './math';
console.log('Hello from main.js');
console.log(sum(1, 2, 3));
```

```js title="src/app.js"
import { sum } from './math';
console.log('Hello from app.js');
console.log(sum(4, 5, 6));
```

```html title="public/index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>code splitting demo 1</title>
  </head>
  <body></body>
</html>
```

此时项目所需文件已经创建好了，接下来安装相关依赖。

先 `npm init -y` 初始化项目，然后安装 webpack 和 webpack-cli 以及 html-webpack-plugin。

```bash npm2yarn
npm init -y
npm install webpack webpack-cli html-webpack-plugin -D
```

创建好项目后的项目结构如下：

```bash
├── public
|   ├── index.html
├── src
|   ├── app.js
|   ├── math.js
|   └── main.js
├── package.json
├── package-lock.json (此文件是用npm安装依赖时自动生成的，若是用其他包管理工具，会有所不同)
└── webpack.config.js
```

### 运行命令

```bash
npx webpack
```

运行命令后，会在 dist 文件夹下生成 main.js 和 app.js 文件。

```bash
├── dist
|   ├── js
|   |   ├── app.bundle.js
|   |   └── main.bundle.js
|   └── index.html
```

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011146875.png?imageSlim)

从上述结果可以看出配置了多入口后，有几个入口就有几个输出文件。但是 math.js 由于没有在入口中配置，所以没有被打包到输出文件中，而是在各个引入了 math.js 的文件中覆写了一份 math.js。

当 math.js 文件越来越大，被引用次数越来越多时，会导致打包的文件成指数级增长，性能也会越来越低。

## 防止重复-SplitChunksPlugin

为了解决上述问题，Webpack 提供了 `SplitChunksPlugin` 插件，可以自动地分割代码，并防止重复。

### 修改配置文件

```js title="webpack.config.js"
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 单入口
  // entry: './src/main.js',
  // 多入口
  entry: {
    main: './src/main.js',
    app: './src/app.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    // [name]是webpack命名规则，使用chunk的name作为输出的文件名。
    // 什么是chunk？打包的资源就是chunk，输出出去叫bundle。
    // chunk的name是啥呢？ 比如： entry中xxx: "./src/xxx.js", name就是xxx。注意是前面的xxx，和文件名无关。
    // 为什么需要这样命名呢？如果还是之前写法main.js，那么打包生成两个js文件都会叫做main.js会发生覆盖。(实际上会直接报错的)
    filename: 'js/[name].bundle.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  mode: 'production',
  // highlight-start
  optimization: {
    // 代码分割配置
    splitChunks: {
      chunks: 'all', // 对所有模块都进行分割
      // 以下是默认值
      // minSize: 20000, // 分割代码最小的大小
      // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
      // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
      // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
      // maxInitialRequests: 30, // 入口js文件最大并行请求数量
      // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
      // cacheGroups: { // 组，哪些模块要打包到一个组
      //   defaultVendors: { // 组名
      //     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
      //     priority: -10, // 权重（越大越高）
      //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
      //   },
      //   default: { // 其他没有写的配置会使用上面的默认值
      //     minChunks: 2, // 这里的minChunks权重更大
      //     priority: -20,
      //     reuseExistingChunk: true,
      //   },
      // },
      // 修改配置
      cacheGroups: {
        // 组，哪些模块要打包到一个组
        // defaultVendors: { // 组名
        //   test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
        //   priority: -10, // 权重（越大越高）
        //   reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
        // },
        default: {
          // 其他没有写的配置会使用上面的默认值
          minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  // highlight-end
};
```

### 运行命令

```bash
npx webpack
```

打包后的文件目录如下：

```bash
├── dist
|   ├── js
|   |   ├── app.bundle.js
|   |   ├── main.bundle.js
|   |   └── 456.bundle.js (新增文件，名字是生成的chunk的名字，对应的是没打包之前的math.js)
|   └── index.html
```

观察文件内容可以发现，math.js 被分割成了一个单独的文件，并没有被覆写到 main.js 和 app.js 中。

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011215198.png?imageSlim)

## 动态导入-import

Webpack 也提供了动态导入的功能，可以按需加载模块，从而实现代码分割以此来显著提升某些页面的加载速度。

为了能体现动态导入的效果，我们稍微为项目添加一个简单的按钮点击功能。

```js title="src/count.js"
export function count(a, b) {
  return a - b;
}
```

```js title="src/main.js"
import { sum } from './math';
// highlight-next-line
import { count } from './count';
console.log('Hello from main.js');
console.log(sum(1, 2, 3));

// highlight-start
document.getElementById('btn').onclick = () => {
  console.log(count(8, 6));
};
// highlight-end
```

```html title="public/index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>code splitting demo 2</title>
  </head>
  <body>
    <!-- highlight-next-line -->
    <button id="btn">count</button>
  </body>
</html>
```

此时打包观察配置动态导入前的效果：

```bash
npx webpack
```

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011427239.png?imageSlim)

目前可以看到因为 main.buldle.js 调用了 count.js 所以 count.js 被打包进了 main.buldle.js 。

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011229867.png?imageSlim)

而如上图所示 app.bundle.js 、 main.bundle.js 、 456.bundle.js 三个文件在首次运行时就全部同时加载了，但我们并未点击按钮去触发 count 函数。

接下来我们使用动态导入按需加载模块。

### 修改文件代码

```js title="src/main.js"
import { sum } from './math';
// highlight-next-line
// import { count } from './count';
console.log('Hello from main.js');
console.log(sum(1, 2, 3));

document.getElementById('btn').onclick = function () {
  // highlight-start
  // 动态导入 --> 实现按需加载
  // 即使只被引用了一次，也会代码分割
  import('./count.js').then(({ count }) => {
    console.log(count(8, 6));
  });
  // highlight-end
};
```

### 运行命令

```bash
npx webpack
```

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011434885.png?imageSlim)

此时可以看到， count.bundle.js 被分割成一个单独的文件。

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011439694.png?imageSlim)

此时点击按钮，可以看到 count 函数被按需加载，并执行。

## 单入口配置

由于我们在开发时可能采用的时 SPA（单页应用） 模式，即只有一个入口文件。

### 修改文件

```js title="webpack.config.js"
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // highlight-start
  // 单入口
  entry: './src/main.js',
  // 多入口
  // entry: {
  //   main: './src/main.js',
  //   app: './src/app.js',
  // },
  // highlight-end
  output: {
    path: path.resolve(__dirname, './dist'),
    // [name]是webpack命名规则，使用chunk的name作为输出的文件名。
    // 什么是chunk？打包的资源就是chunk，输出出去叫bundle。
    // chunk的name是啥呢？ 比如： entry中xxx: "./src/xxx.js", name就是xxx。注意是前面的xxx，和文件名无关。
    // 为什么需要这样命名呢？如果还是之前写法main.js，那么打包生成两个js文件都会叫做main.js会发生覆盖。(实际上会直接报错的)
    filename: 'js/[name].bundle.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  mode: 'production',
  optimization: {
    // 代码分割配置
    splitChunks: {
      chunks: 'all', // 对所有模块都进行分割
      // 以下是默认值
      // minSize: 20000, // 分割代码最小的大小
      // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
      // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
      // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
      // maxInitialRequests: 30, // 入口js文件最大并行请求数量
      // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
      // cacheGroups: { // 组，哪些模块要打包到一个组
      //   defaultVendors: { // 组名
      //     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
      //     priority: -10, // 权重（越大越高）
      //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
      //   },
      //   default: { // 其他没有写的配置会使用上面的默认值
      //     minChunks: 2, // 这里的minChunks权重更大
      //     priority: -20,
      //     reuseExistingChunk: true,
      //   },
      // },
      // 修改配置
      cacheGroups: {
        // 组，哪些模块要打包到一个组
        // defaultVendors: { // 组名
        //   test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
        //   priority: -10, // 权重（越大越高）
        //   reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
        // },
        default: {
          // 其他没有写的配置会使用上面的默认值
          minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

为了体现单入口效果，并体现 node_modules 的代码分割，我们在项目中引入一个第三方库 [dayjs](https://github.com/iamkun/dayjs)。

```bash npm2yarn
npm install dayjs -S
```

```js title="src/main.js"
import { sum } from './math';

console.log('Hello from main.js');
console.log(sum(1, 2, 3));

document.getElementById('btn').onclick = function () {
  // 动态导入 --> 实现按需加载
  // 即使只被引用了一次，也会代码分割
  import('./count.js').then(({ count }) => {
    console.log(count(8, 6));
  });
  // highlight-start
  // 引入第三方库 --> 实现代码分割
  import('dayjs').then(({ default: dayjs }) => {
    console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  });
  // highlight-end
};
```

### 运行命令

```bash
npx webpack
```

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011510832.png?imageSlim)

此时可以看到， dayjs 被分割成一个单独的文件。

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011509580.png?imageSlim)

从上图可以看出，点击按钮，可以看到 count 函数和 dayjs 被按需加载，并执行。

我们已经进行了代码分割，并使用 `import` 动态导入语法实现按需加载（即懒加载，例如路由懒加载就是通过这种方式实现的）。

然而，加载速度仍不够理想。例如，当用户点击按钮时才加载资源，如果资源体积较大，用户会感觉到明显的卡顿。

为了解决这个问题，我们希望在浏览器空闲时间加载后续需要的资源。因此，我们需要利用 `Preload` 或 `Prefetch` 技术。

## preload 和 prefetch 配置

先来介绍一下这两个技术的异同点。

它们的共同点：

- 只加载资源，不执行。
- 具有缓存功能。

它们的区别：

- `Preload` 加载优先级高，而 `Prefetch` 加载优先级低。
- `Preload` 只能加载当前页面需要的资源，而 `Prefetch` 既可以加载当前页面的资源，也可以加载下一个页面需要的资源。

总结：

- 当前页面优先级高的资源使用 `Preload` 加载。
- 下一个页面需要的资源使用 `Prefetch` 加载。

它们的问题：兼容性较差。

- 我们可以通过 [Can I Use](https://caniuse.com/) 网站查询 API 的兼容性问题。
- 相比之下，`Preload` 的兼容性比 `Prefetch` 更好。

接下来我们来实操一下 `Preload` 和 `Prefetch` 的配置。

### 修改文件

```js title="main.js"
import { sum } from './math';

console.log('Hello from main.js');
console.log(sum(1, 2, 3));

document.getElementById('btn').onclick = function () {
  // 动态导入 --> 实现按需加载
  // 即使只被引用了一次，也会代码分割
  // highligh-next-line
  import(/* webpackPrefetch: true */ './count.js').then(({ count }) => {
    console.log(count(8, 6));
  });
  // highligh-next-line
  import(/* webpackPreload: true */ 'dayjs').then(({ default: dayjs }) => {
    console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  });
};
```

webpack5 新增了 `webpackPreload` 和 `webpackPrefetch` 注释，用来配置资源加载策略。

### 运行命令

```bash
npx webpack
```

![效果图](https://tecent-oss-shanghai.eaveluo.com/img/202407011555851.png?imageSlim)

从上图可以看出，我们给 count.js 添加了 prefecth ，故在页面加载时就会加载 count.js ，而到真正点击按钮时不会发起请求，而是直接从缓存中加载 ，从而提高了点击时的响应速度。

:::warning
不正确地使用 webpackPreload 会有损性能，请谨慎使用。
:::
