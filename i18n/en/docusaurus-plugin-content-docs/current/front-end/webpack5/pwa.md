---
sidebar_position: 19
slug: pwa
title: PWA
tags: [Webpack, packaging tool, front-end engineering, performance optimization]
keywords:
  - Webpack
  - packaging tool
  - front-end engineering
  - performance optimization
  - PWA
---

When developing a Web App project, once the project is offline, it cannot be accessed.

We hope to provide an offline experience for the project, which requires the use of PWA (Progressive Web App) technology.

## What is PWA

Progressive web application (PWA): is a technology that can provide a Web App experience similar to native app.

The most important thing is that the application can continue to run when **offline**.

It is implemented internally through Service Workers technology.

### How to use

Install dependencies

```bash npm2yarn
npm i workbox-webpack-plugin -D
```

Modify the configuration file

```js title="webpack.config.js"
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// highlight-next-line
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  // Single entry
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
      // These options help enable ServiceWorkers quickly
      // Do not allow any "old" ServiceWorkers to be left behind
      clientsClaim: true,
      skipWaiting: true,
    }),
    // highlight-end
  ],
  mode: 'production',
  optimization: {
    // Code splitting configuration
    splitChunks: {
      chunks: 'all', // Split all modules
      // Modify configuration
      cacheGroups: {
        default: {
          minSize: 0, // The file size we defined is too small, so we need to change the minimum file size for packaging
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
  // Dynamic import --> On-demand loading
  // Even if it is only referenced once, the code will be split
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

### Run command

```bash
npx webpack
```

After running the command, there will be an additional service-worker.js and workbox-1c3383c2.js in the generated dist directory (the file name may be different):

:::tip Tip
At this time, you need to deploy the project to the server to access it, otherwise it will report `SW registration failed: TypeError: Failed to register a ServiceWorker for scope ('http://127.0.0.1:5500/') with script ('http://127.0.0.1:5500/service-worker.js'): A bad HTTP response code (404) was received when fetching the script.`。
:::

You can use the `serve` tool to simulate the server scenario:

```bash
npx serve dist
```

Open the browser to access the deployed project address, switch the network to offline state, and refresh the page to see the effect of the PWA project.
