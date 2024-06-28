---
    sidebar_position: 2
    slug: base
    title: 基本使用
    description: 介绍 Webpack5 的基本使用
    tags: [Webpack, 打包工具, 前端工程化]
    keywords:
    - Webpack
    - 打包工具
    - 前端工程化
    - 基本使用
---

Webpack 会以一个或多个文件作为打包入口，将项目中的所有文件编译组合成一个或多个输出文件，即 `bundle` ，这些文件可以在浏览器中运行。

## 资源目录

```bash
webpack_code # 项目根目录
    └── src # 项目源码目录
        ├── js # js 文件目录
        │   ├── count.js
        │   └── sum.js
        └── main.js # 项目主文件
```

## 创建文件

```js title="count.js"
export default function count(a, b) {
  return a - b;
}
```

```js title="sum.js"
export default function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
```

```js title="main.js"
import count from './js/count';
import sum from './js/sum';

console.log('Difference:', count(10, 3)); // 7
console.log('Sum:', sum(1, 2, 3, 4, 5)); // 15
```

## 下载依赖

打开终端，进入项目根目录，运行以下指令来初始化 package.json ：

```bash npm2yarn
npm init -y
```

此时会生成一个基础的 `package.json` 文件：

```json
{
  "name": "webpack-demo",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}
```

**需要注意的是 `package.json` 中 `name` 字段不能叫做 `webpack`, 否则下一步会报错**。

接着下载依赖：

```bash npm2yarn
npm i webpack webpack-cli -D
```

## 启用 Webpack

开发模式

```bash
npx webpack ./src/main.js --mode=development
```

生产模式

```bash
npx webpack ./src/main.js --mode=production
```

- `npx webpack`: 运行本地安装 `Webpack` 包的。

- `./src/main.js`: 指定 `Webpack` 从 `main.js` 文件开始打包，包括其依赖的文件。

- `--mode=xxx`：指定模式（环境）。

## 观察输出文件

默认情况下，Webpack 会将文件打包输出到 `dist` 目录下，查看 `dist` 目录下的文件情况即可。

## 小结

Webpack 本身只能处理 `JS` 资源，处理其他类型资源（如 `CSS`）时，需要配置额外的 `loader` 和 `插件` 。
