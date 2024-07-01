---
    sidebar_position: 19
    slug: pwa
    title: PWA
    tags: [Webpack, 打包工具, 前端工程化, 性能优化]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 性能优化
    - PWA
---

开发 Web App 项目，项目一旦处于网络离线情况，就没法访问了。

我们希望给项目提供离线体验，这就需要用到 PWA（Progressive Web App）技术。

## 什么是 PWA

渐进式网络应用程序(progressive web application - PWA)：是一种可以提供类似于 native app(原生应用程序) 体验的 Web App 的技术。

其中最重要的是，在 **离线(offline)** 时应用程序能够继续运行功能。

内部通过 Service Workers 技术实现的。

### 怎么用

安装依赖

```bash npm2yarn
npm i workbox-webpack-plugin -D
```

修改配置文件

```js title="webpack.config.js"
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// highlight-next-line
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  // 单入口
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'js/[name].bundle.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    // highlight-start
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助快速启用 ServiceWorkers
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true,
    }),
    // highlight-end
  ],
  mode: 'production',
  optimization: {
    // 代码分割配置
    splitChunks: {
      chunks: 'all', // 对所有模块都进行分割
      // 修改配置
      cacheGroups: {
        default: {
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

```js title="src/main.js"
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

// highlight-start
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
// highlight-end
```

### 运行命令

```bash
npx webpack
```

运行命令后生成的 dist 目录下会多出一个 service-worker.js 和 workbox-1c3383c2.js（文件名可能不同）：

:::tip 提示
此时需要将项目部署到服务器上才能访问，否则会报 `SW registration failed: TypeError: Failed to register a ServiceWorker for scope ('http://127.0.0.1:5500/') with script ('http://127.0.0.1:5500/service-worker.js'): A bad HTTP response code (404) was received when fetching the script.`。
:::

模拟服务器场景可以用 `serve` 工具：

```bash
npx serve dist
```

打开浏览器访问部署的项目地址，将网络切换到离线状态，刷新页面即可看到 PWA 项目的效果。
