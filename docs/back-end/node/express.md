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

- GET 请求，`http://localhost:8080/`：响应内容为 `GET request to the homepage`。
- POST 请求， `http://localhost:8080/`： 响应内容为 `POST request to the homepage`。
- PUT 请求，`http://localhost:8080/user`：响应内容为 `PUT request to /user`。
- DELETE 请求，`http://localhost:8080/user`：响应内容为 `DELETE request to /user`。
- 所有请求，`http://localhost:8080/all`：响应内容为 `This is a all request`。

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
  console.log(req.params);
  res.send(`User ID: ${req.params.id}`);
});

app.get('/users/*', (req, res) => {
  console.log(req.params);
  res.send(`User Name: ${req.params}`);
});

app.get('/optional/:name?', (req, res) => {
  console.log(req.params);
  res.send(`Optional Name: ${req.params.name || 'Not provided'}`);
});
// highlight-end

// 启动应用，监听指定端口
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`); // 输出应用启动信息
});
```

针对上述路由，可以测试以下 URL，因为 req.params 可能为对象，注意看控制台输出：

下列均为 GET 请求：

- `http://localhost:8080/user/123`：控制台输出：`{ id: '123' }`，响应内容为 `User ID: 123`。
- `http://localhost:8080/users/eave/luo`：控制台输出：`{ '0': 'eave/luo' }`，响应内容为 `User Name: eave/luo`。
- `http://localhost:8080/optional`：控制台输出：`{ name: undefined }`，响应内容为 `Optional Name: Not provided`。
- `http://localhost:8080/optional/eave`：控制台输出：`{ name: 'eave' }`，响应内容为 `Optional Name: eave`。

### 路由组

路由组（Routing Group）是一种将相关的路由组织在一起的方式，使代码更加模块化和易于维护。可以使用路由器（Router()）来定义路由组，以下是一个示例：

```javascript
const express = require('express');
const app = express();
const router = express.Router();

// highlight-start
// 定义一个路由
router.get('/', (req, res) => {
  res.send('Home Page');
});

// 定义另一个路由
router.get('/about', (req, res) => {
  res.send('About Page');
});

// 将路由组挂载到应用程序中
app.use('/mygroup', router);
// highlight-end

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

在这个示例中，我们首先创建了一个`router`对象，然后定义了一些路由（`/`和`/about`），并将这些路由挂载到应用程序的`/mygroup`路径下。因此，当用户访问`/mygroup`或`/mygroup/about`时，将会触发相应的路由处理程序：

- GET 请求： `http://localhost:8080/mygroup`：响应内容为 `Home Page`。
- GET 请求： `http://localhost:8080/mygroup/about`：响应内容为 `About Page`。

#### 路由组的优点

- **模块化**：将相关的路由组织在一起，使代码更加清晰和模块化。
- **中间件复用**：可以为一组路由定义公共的中间件，而不必为每个路由单独定义。
- **代码组织**：帮助开发者更好地组织代码，尤其是在处理大型项目时。

通过使用路由组，可以更好地管理和维护 Node.js 应用程序的路由逻辑。

## 中间件

中间件是 Express 应用中请求处理管道中的函数。每个中间件函数都可以访问请求对象（req）、响应对象（res）和下一个中间件函数（next）。

### 应用级中间件

```javascript
const express = require('express');
const app = express();
const router = express.Router();

// highlight-start
// 定义一个应用级中间件
app.use((req, res, next) => {
  console.log('APP定义的应用级中间件');
  next();
});
// highlight-end

// 使用app定义一个路由
app.get('/app', (req, res) => {
  res.send('APP');
});

// 使用router定义一个路由
router.get('/test', (req, res) => {
  res.send('Router');
});

// 将路由组挂载到应用程序中
app.use('/router', router);

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

设置了应用级中间件后，它将在中间件后的所有请求处理之前执行。

### 路由级中间件

```javascript
const express = require('express');
const app = express();
const router = express.Router();

// highlight-start
// 定义一个路由级中间件
router.use((req, res, next) => {
  console.log('router定义的路由级中间件');
  next();
});
// highlight-end

// 使用app定义一个路由
app.get('/app', (req, res) => {
  res.send('APP');
});

// 使用router定义一个路由
router.get('/test', (req, res) => {
  res.send('Router');
});

// 将路由组挂载到应用程序中
app.use('/router', router);

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

路由级中间件只会处理路由组内的请求，如上述的例子中只会处理 `/router` 下的请求，请求 `http://localhost:8080/app` 将不会触发路由级中间件。

### 错误处理中间件

在 Node.js 中使用 Express 框架进行错误处理时，可以定义错误处理中间件来捕获和处理应用程序中的错误。这些中间件与普通的中间件函数类似，但有一个显著的区别：错误处理中间件函数有四个参数 `(err, req, res, next)`，其中 `err` 是错误对象。

#### 创建错误处理中间件

以下是一个基本的错误处理中间件示例：

```javascript
const express = require('express');
const app = express();

// 定义一个普通的中间件
app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  next();
});

// 定义一个路由
app.get('/', (req, res) => {
  res.send('Hello World');
});

// highlight-start
// 定义一个会产生错误的路由
app.get('/error', (req, res) => {
  throw new Error('This is a forced error.');
});

// 定义错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: 'Something broke!' });
});
// highlight-end

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

在这个示例中：

1. 普通的中间件打印请求的 URL。
2. `/` 路由返回一个简单的"Hello World"消息。
3. `/error` 路由会抛出一个错误。
4. 错误处理中间件捕获错误，并返回 500 状态码和错误消息。

#### 使用 `next` 传递错误

有时你可能希望在捕获错误后将其传递给下一个错误处理中间件。可以通过调用 `next(err)` 来实现：

```javascript
app.use((req, res, next) => {
  //highlight-start
  try {
    // 这里可能会有一些逻辑代码
    throw new Error('Something went wrong!');
  } catch (err) {
    next(err);
  }
  // highlight-end
});

app.use((err, req, res, next) => {
  // highlight-start
  console.error(err.stack);
  res.status(500).json({ code: 500, message: err.message });
  // highlight-end
});
```

#### 捕获异步错误

在处理异步操作时，需要特别注意错误处理。可以使用 `async/await` 和 `try/catch` 块来捕获异步错误：

```javascript
app.get('/async-error', async (req, res, next) => {
  try {
    // 模拟异步操作
    await someAsyncFunction();
    res.send('Success');
  } catch (err) {
    next(err); // 将错误传递给错误处理中间件
  }
});
```

### 中间件的执行顺序

重要的是要确保错误处理中间件放在所有路由和其他中间件之后。Express 会按顺序执行中间件，只有在其他中间件和路由之后定义的错误处理中间件才能捕获错误。

通过正确定义和使用错误处理中间件，可以有效地管理 Node.js 应用程序中的错误处理逻辑，提高应用程序的健壮性和可维护性。

### 内置中间件

Express 提供了一些内置的中间件，可以帮助你处理常见的任务。这些中间件在 Express 4.x 版本及更高版本中是分开安装的，你需要单独安装它们。以下是一些常用的 Express 内置中间件：

#### `express.static`

用于提供静态文件，如图片、CSS 文件和 JavaScript 文件。

```javascript
const express = require('express');
const app = express();

app.use(express.static('public'));

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

在这个例子中，所有在`public`目录下的文件都可以通过 HTTP 请求访问。

#### `express.json`

用于解析传入的 JSON 请求体。这个中间件是 Express 4.16.0 版本新增的。

```javascript
app.use(express.json());

app.post('/user', (req, res) => {
  res.send(req.body);
});
```

在这个例子中，`express.json()`中间件用于解析 POST 请求中包含的 JSON 数据。

#### `express.urlencoded`

用于解析 URL 编码的数据，通常用于解析 HTML 表单提交的数据。这个中间件是 Express 4.16.0 版本新增的。

```javascript
app.use(express.urlencoded({ extended: true }));

app.post('/user', (req, res) => {
  res.send(req.body);
});
```

在这个例子中，`express.urlencoded()`中间件用于解析 POST 请求中包含的 URL 编码数据。

#### 使用这些内置中间件

以下是一个示例，展示如何使用这些内置中间件：

```javascript
const express = require('express');
const app = express();

// 使用 express.static 提供静态文件
app.use(express.static('public'));

// 使用 express.json 解析 JSON 请求体
app.use(express.json());

// 使用 express.urlencoded 解析 URL 编码的数据
app.use(express.urlencoded({ extended: true }));

app.post('/user', (req, res) => {
  res.send(req.body);
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

在这个示例中，我们使用了 `express.static` 来提供静态文件，使用 `express.json` 和 `express.urlencoded` 来解析请求体数据。通过这些内置中间件，可以更方便地处理常见的 Web 开发任务。

## 请求和响应

在 Express 中，`req`（请求对象）和`res`（响应对象）是核心对象，它们分别代表 HTTP 请求和 HTTP 响应。它们提供了丰富的属性和方法，用于处理客户端与服务器之间的交互。

### 请求对象 (`req`)

请求对象包含了 HTTP 请求的所有信息，包括请求头、请求体、URL 参数等。以下是一些常用的请求对象属性和方法：

#### 常用属性

1. **`req.params`**: 包含路由参数的对象。

   ```javascript
   app.get('/user/:id', (req, res) => {
     console.log(req.params.id); // 获取路径参数
   });
   ```

2. **`req.query`**: 包含查询字符串参数的对象。

   ```javascript
   app.get('/search', (req, res) => {
     console.log(req.query.q); // 获取查询参数
   });
   ```

3. **`req.body`**: 包含请求体数据的对象，需使用中间件如`express.json()`解析。

   ```javascript
   app.use(express.json());
   app.post('/user', (req, res) => {
     console.log(req.body); // 获取请求体数据
   });
   ```

4. **`req.headers`**: 包含请求头的对象。

   ```javascript
   app.get('/', (req, res) => {
     console.log(req.headers['user-agent']); // 获取User-Agent头
   });
   ```

5. **`req.method`**: HTTP 请求方法（如 GET、POST）。

   ```javascript
   app.all('*', (req, res) => {
     console.log(req.method); // 获取请求方法
   });
   ```

6. **`req.url`**: 请求的完整 URL。

   ```javascript
   app.get('*', (req, res) => {
     console.log(req.url); // 获取请求URL
   });
   ```

7. **`req.path`**: 请求的路径部分。
   ```javascript
   app.get('*', (req, res) => {
     console.log(req.path); // 获取请求路径
   });
   ```

#### 常用方法

1. **`req.get(field)`**: 获取请求头的值。

   ```javascript
   app.get('/', (req, res) => {
     console.log(req.get('Content-Type')); // 获取Content-Type头
   });
   ```

2. **`req.is(type)`**: 判断请求体的类型。
   ```javascript
   app.post('/', (req, res) => {
     if (req.is('application/json')) {
       console.log('JSON request');
     }
   });
   ```

### 响应对象 (`res`)

响应对象用于构建和发送 HTTP 响应。以下是一些常用的响应对象属性和方法：

#### 常用方法

1. **`res.send(body)`**: 发送响应体，可以是字符串、对象或缓冲区。

   ```javascript
   app.get('/', (req, res) => {
     res.send('Hello World');
   });
   ```

2. **`res.json(obj)`**: 发送 JSON 响应。

   ```javascript
   app.get('/user', (req, res) => {
     res.json({ name: 'John', age: 30 });
   });
   ```

3. **`res.status(code)`**: 设置 HTTP 状态码。

   ```javascript
   app.get('/not-found', (req, res) => {
     res.status(404).send('Page not found');
   });
   ```

4. **`res.redirect(url)`**: 重定向到指定的 URL。

   ```javascript
   app.get('/redirect', (req, res) => {
     res.redirect('/new-page');
   });
   ```

5. **`res.render(view, [locals])`**: 渲染视图并发送响应（通常与模板引擎一起使用）。

   ```javascript
   app.set('view engine', 'pug');
   app.get('/home', (req, res) => {
     res.render('index', { title: 'Home' });
   });
   ```

6. **`res.set(field, [value])`**: 设置响应头。

   ```javascript
   app.get('/', (req, res) => {
     res.set('Content-Type', 'text/plain');
     res.send('Hello World');
   });
   ```

7. **`res.cookie(name, value, [options])`**: 设置 Cookie。

   ```javascript
   app.get('/set-cookie', (req, res) => {
     res.cookie('name', 'value', { maxAge: 900000 });
     res.send('Cookie is set');
   });
   ```

8. **`res.clearCookie(name, [options])`**: 清除 Cookie。
   ```javascript
   app.get('/clear-cookie', (req, res) => {
     res.clearCookie('name');
     res.send('Cookie is cleared');
   });
   ```

### 综合示例

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = req.query.search;
  res.send(`User ID: ${userId}, Search Query: ${query}`);
});

app.post('/user', (req, res) => {
  const userData = req.body;
  res.status(201).json(userData);
});

app.get('/redirect', (req, res) => {
  res.redirect('/new-location');
});

app.get('/new-location', (req, res) => {
  res.send('You have been redirected!');
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

在这个综合示例中，我们展示了如何使用请求和响应对象的各种属性和方法来处理客户端请求并构建服务器响应。

## 结论

Express 是一个功能强大且灵活的 Node.js Web 应用框架，适用于构建各种类型的 Web 应用。通过理解其路由、中间件、请求和响应处理、模板引擎等功能，可以帮助开发者更好地利用 Express 构建高性能和可维护的 Web 应用。
