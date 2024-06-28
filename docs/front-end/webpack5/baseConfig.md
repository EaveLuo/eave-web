---
    sidebar_position: 3
    slug: base-config
    title: 基本配置
    tags: [Webpack, 打包工具, 前端工程化]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 基本配置
---

在开始使用 `Webpack` 之前，我们需要对 `Webpack` 的配置有一定的认识。

## 5 大核心概念

- entry（入口）：指示 Webpack 从哪个文件开始打包。

- output（输出）: 指示 Webpack 打包后的文件输出到哪里以及如何命名。

- loader（加载器）: Webpack 本身只能处理 JS、JSON 等资源，其他资源需要借助 loader 才能解析。

- plugins（插件）: 扩展 Webpack 的功能。

- mode（模式）：主要有开发模式和生产模式。

  - 开发模式：用于开发阶段，提供友好的错误提示和完整的源代码以便调试。

  - 生产模式：用于发布阶段，优化和压缩代码以提高性能。

## 准备 Webpack 配置文件

在项目根目录下新建文件：`webpack.config.js`

```js title="webpack.config.js"
module.exports = {
  // 入口
  entry: '',
  // 输出
  output: {},
  // 加载器
  module: {
    rules: [],
  },
  // 插件
  plugins: [],
  // 模式
  mode: '',
};
```

Webpack 基于 Node.js 运行，因此采用 Common.js 模块化规范。

## 修改配置文件

```js title="webpack.config.js"
const path = require('path');

module.exports = {
  // 入口
  entry: './src/main.js',
  // 输出
  output: {
    // 文件输出目录，必须是绝对路径
    path: path.resolve(__dirname, 'dist'),
    // 输出文件名
    filename: 'main.js',
  },
  // 加载器
  module: {
    rules: [],
  },
  // 插件
  plugins: [],
  // 模式
  mode: 'development', // 开发模式
};
```

## 运行指令

```bash
npx webpack
```

此时功能和之前一样，仍然不能处理样式等其他资源文件，后续章节将介绍如何处理其他资源文件。

## 小结

Webpack 将通过 `webpack.config.js` 文件进行配置，来增强 Webpack 的功能。

我们后面将以开发模式和生产模式分别搭建 Webpack 的配置，先进行开发模式，再完成生产模式。
