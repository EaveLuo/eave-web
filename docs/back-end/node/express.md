---
sidebar_position: 11
slug: express
title: Express 框架
description: Express 框架是 Node.js 开发的一个轻量级的 Web 应用框架。
tags: [Node.js, Express, 后端框架]
keywords:
  - Node.js
  - Express
  - 后端框架
---

Express 是一个简洁而灵活的 Node.js Web 应用框架，为构建单页、多页和混合 Web 应用程序提供了一系列强大的功能。Express 是构建 Node.js Web 应用的事实标准，因其极简的设计和丰富的插件生态系统而广受欢迎。

## 特点

1. **简洁易用**：Express 提供了一个简单的接口，用于定义路由、处理中间件和响应请求。
2. **高性能**：Express 基于 Node.js，利用其事件驱动和非阻塞 I/O 模型，提供高性能的 Web 应用。
3. **灵活性**：Express 提供了极高的灵活性，可以根据需要扩展和定制应用程序。
4. **中间件**：Express 提供了一套中间件机制，可以在请求处理的各个阶段插入自定义逻辑。
5. **强大的生态系统**：Express 具有大量的插件和中间件，丰富了其功能。

## 起步

让我们从 0 开始一个简单的 Express 应用。

### 初始化项目

创建一个新目录并初始化 npm 项目：

```bash npm2yarn
mkdir myapp
cd myapp
npm init -y
```

安装 Express：

```bash npm2yarn
npm install express
```

### 创建一个基本的 Express 应用

```javascript title="app.js"
const express = require('express'); // 引入 Express 模块
const app = express(); // 创建 Express 应用实例
const port = 8080; // 定义应用监听的端口

// 定义根路径的 GET 请求处理函数
app.get('/', (req, res) => {
  res.send('Hello, World!'); // 发送响应内容
});

// 启动应用，监听指定端口
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`); // 输出应用启动信息
});
```

运行应用：

```bash
node app.js
```

在浏览器中访问 `http://localhost:8080`，可以看到 "Hello, World!"。

## 路由

路由是指根据 URL 请求的路径和方法来定义处理逻辑。Express 提供了多种定义路由的方法。

### 基本路由

基本路由可以处理 GET、POST、PUT、DELETE 请求：

- `app.get(path, callback)`：处理 GET 请求。
- `app.post(path, callback)`：处理 POST 请求。
- `app.put(path, callback)`：处理 PUT 请求。
- `app.delete(path, callback)`：处理 DELETE 请求。

还有个特殊的路由 `app.all(path, callback)`，可以处理所有 HTTP 请求。

```javascript title="app.js"
const express = require('express'); // 引入 Express 模块
const app = express(); // 创建 Express 应用实例
const port = 8080; // 定义应用监听的端口

// highlight-start
// 定义路由
app.get('/', (req, res) => {
  res.send('GET request to the homepage');
});

app.post('/', (req, res) => {
  res.send('POST request to the homepage');
});

app.put('/user', (req, res) => {
  res.send('PUT request to /user');
});

app.delete('/user', (req, res) => {
  res.send('DELETE request to /user');
});

app.all('/all', (req, res) => {
  res.send('This is a all request');
});
// highlight-end

// 启动应用，监听指定端口
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`); // 输出应用启动信息
});
```

运行应用：

```bash
node app.js
```

此时建议使用[接口调试工具](/docs/back-end/web-api#接口调试工具)来测试这些路由。

### 参数路由

参数路由可以匹配路径中包含的动态参数：

- `:param`：匹配一个单词。
- `:*`：匹配多个单词。
- `:param?`：匹配可选参数。

```javascript title="app.js"
const express = require('express'); // 引入 Express 模块
const app = express(); // 创建 Express 应用实例
const port = 8080; // 定义应用监听的端口

// highlight-start
// 定义路由
app.get('/user/:id', (req, res) => {
  res.send(`User ID: ${req.params.id}`);
});

app.get('/users/:name*', (req, res) => {
  res.send(`User Name: ${req.params.name}`);
});

app.get('/optional/:name?', (req, res) => {
  res.send(`Optional Name: ${req.params.name || 'Not provided'}`);
});
// highlight-end

// 启动应用，监听指定端口
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`); // 输出应用启动信息
});
```

### 路由组

可以使用 Express 路由器来定义路由组：

```javascript
const router = express.Router();

router.get('/', (req, res) => {
  res.send('GET request to the /user');
});

router.post('/', (req, res) => {
  res.send('POST request to the /user');
});

app.use('/user', router);
```

## 中间件

中间件是 Express 应用中请求处理管道中的函数。每个中间件函数都可以访问请求对象（req）、响应对象（res）和下一个中间件函数（next）。

### 应用级中间件

```javascript
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});
```

### 路由级中间件

```javascript
const router = express.Router();

router.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  next();
});

router.get('/', (req, res) => {
  res.send('Hello from router!');
});

app.use('/router', router);
```

### 错误处理中间件

错误处理中间件有四个参数（err, req, res, next）：

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

### 内置中间件

Express 还提供了一些内置中间件，如 `express.static` 用于提供静态文件：

```javascript
app.use(express.static('public'));
```

## 请求和响应

### 请求对象

`req` 对象包含了 HTTP 请求的各种信息，包括请求头、请求参数、请求体等。

```javascript
app.get('/user/:id', (req, res) => {
  console.log(req.params.id); // 获取路由参数
  console.log(req.query.name); // 获取查询字符串参数
  res.send('User Info');
});
```

### 响应对象

`res` 对象用于向客户端发送响应。

```javascript
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/json', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.get('/file', (req, res) => {
  res.sendFile('/path/to/file');
});
```

## 使用模板引擎

Express 支持多种模板引擎，如 Pug、EJS 等。以下是使用 Pug 作为模板引擎的示例。

### 安装 Pug

```bash
npm install pug
```

### 配置 Pug

```javascript
app.set('view engine', 'pug');
app.set('views', './views');
```

### 创建 Pug 模板

在 `views` 目录下创建一个 `index.pug` 文件：

```pug
doctype html
html
  head
    title= title
  body
    h1= message
```

### 渲染 Pug 模板

```javascript
app.get('/pug', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' });
});
```

## 结论

Express 是一个功能强大且灵活的 Node.js Web 应用框架，适用于构建各种类型的 Web 应用。通过理解其路由、中间件、请求和响应处理、模板引擎等功能，可以帮助开发者更好地利用 Express 构建高性能和可维护的 Web 应用。
