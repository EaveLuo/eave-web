---
    sidebar_position: 8
    slug: http
    title: http 模块
    description: http 模块是 Node.js 的核心模块之一，用于创建和服务 HTTP 服务器。
    tags: [Node.js, http]
    keywords:
    - Node.js
    - http
---

在介绍 `http` 模块之前，我们先来了解一下 HTTP 协议，更有助于我们使用 Node.js 中的 `http` 模块。

## HTTP 协议

HTTP（HyperText Transfer Protocol，超文本传输协议）是用于在 Web 浏览器和 Web 服务器之间传输超文本的标准协议。它是 Web 应用的基础协议，定义了客户端（通常是浏览器）和服务器之间如何请求和传输资源（如 HTML 文档、图像、视频等）。下面是 HTTP 协议的一些关键概念和细节：

### HTTP 的基本工作原理

HTTP 是一个无状态的、应用层的协议，基于请求-响应模型。客户端发送一个 HTTP 请求到服务器，服务器处理请求并返回一个 HTTP 响应。

#### 请求-响应模型

- **客户端（Client）**：发送 HTTP 请求到服务器。通常是浏览器，也可以是其他类型的客户端如移动应用或爬虫。
- **服务器（Server）**：接收并处理客户端的请求，返回 HTTP 响应。

#### 无状态性

HTTP 是无状态协议，这意味着每次请求都是独立的，服务器不会保留任何关于客户端的状态。每个请求都包含了完成请求所需的所有信息。

### HTTP 请求

HTTP 请求由三个主要部分组成：请求行、请求头部和请求主体。

#### 请求行

请求行包含三个部分：HTTP 方法、请求目标（通常是 URL）和 HTTP 版本。

```plaintext
GET /index.html HTTP/1.1
```

- **HTTP 方法**：指定请求的类型。常见的方法包括：

  - `GET`：请求资源。
  - `POST`：向服务器提交数据。
  - `PUT`：更新资源。
  - `DELETE`：删除资源。
  - `HEAD`：请求资源的头部信息。
  - `OPTIONS`：询问服务器支持的 HTTP 方法。
  - `PATCH`：对资源进行部分修改。

- **请求目标**：通常是资源的路径或 URL。

- **HTTP 版本**：指定 HTTP 协议的版本。常见的版本有 HTTP/1.0、HTTP/1.1 和 HTTP/2。

#### 请求头部

请求头部包含多个头字段，每个头字段都包含键和值，用于传递额外的信息。

```plaintext
Host: www.eaveluo.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
```

常见的请求头字段包括：

- `Host`：指定请求的主机名和端口号。
- `User-Agent`：包含客户端的信息（如浏览器类型和版本）。
- `Accept`：指定客户端可接受的媒体类型。
- `Content-Type`：指示请求主体的媒体类型（如`application/json`）。

#### 请求主体

请求主体包含客户端发送到服务器的数据，通常用于`POST`或`PUT`请求。例如，提交表单数据或上传文件。

### HTTP 响应

HTTP 响应也由三个主要部分组成：状态行、响应头部和响应主体。

#### 状态行

状态行包含三个部分：HTTP 版本、状态码和状态短语。

```plaintext
HTTP/1.1 200 OK
```

- **HTTP 版本**：指定 HTTP 协议的版本。
- **状态码**：三位数字，指示响应的结果。常见状态码包括：

  - `200 OK`：请求成功。
  - `301 Moved Permanently`：资源已永久移动到新位置。
  - `404 Not Found`：请求的资源不存在。
  - `500 Internal Server Error`：服务器内部错误。

- **状态短语**：对状态码的简短描述。

#### 响应头部

响应头部包含多个头字段，每个头字段都包含键和值，用于传递额外的信息。

```plaintext
Content-Type: text/html; charset=UTF-8
Content-Length: 138
```

常见的响应头字段包括：

- `Content-Type`：指示响应主体的媒体类型和字符集。
- `Content-Length`：指示响应主体的长度（以字节为单位）。
- `Set-Cookie`：设置 cookie。

#### 响应主体

响应主体包含服务器返回给客户端的数据，例如 HTML 文档、图像、视频等。

### HTTP 版本

#### HTTP/1.0

- 每个请求/响应对使用一个单独的 TCP 连接。
- 无法进行持续连接。

#### HTTP/1.1

- 引入了持久连接，允许多个请求和响应在一个 TCP 连接上进行。
- 支持分块传输编码。
- 引入了更多的缓存控制机制。

#### HTTP/2

- 多路复用：一个 TCP 连接上可以并行处理多个请求和响应。
- 头部压缩：减少请求和响应头部的大小。
- 服务器推送：服务器可以主动向客户端发送资源。

### HTTPS

HTTPS（HyperText Transfer Protocol Secure）是 HTTP 的安全版本，通过 TLS（传输层安全协议）或 SSL（安全套接字层）对通信进行加密，确保数据的机密性和完整性。

总结来说，HTTP 协议是互联网中应用最广泛的协议之一，支持 Web 浏览器和服务器之间的通信，随着版本的升级，性能和安全性也不断提高。

## http 模块

Node.js 中的`http`模块是用于创建 HTTP 服务器和客户端的核心模块。它提供了一些用于处理 HTTP 请求和响应的方法和类，使得在 Node.js 环境下构建网络应用变得更加简单。下面是`http`模块的一些关键组成部分和使用方法：

### 引入`http`模块

要使用`http`模块，需要先引入它：

```javascript
const http = require('http');
```

### 创建 HTTP 服务器

使用`http`模块可以创建一个 HTTP 服务器，服务器可以监听特定的端口并处理客户端的请求。

```javascript
const http = require('http');

// 创建服务器
const server = http.createServer((request, response) => {
  // 响应内容
  response.end('你好，http!\n');
});

// 服务器监听端口8080
server.listen(8080, () => {
  console.log('服务器运行在 http://127.0.0.1:8080/');
});
```

- `http.createServer(callback)`: 创建一个新的 HTTP 服务器，并在请求到达时调用`callback`函数。

- `request`（请求对象）: 包含有关客户端请求的信息（例如，HTTP 方法、请求 URL、头部信息等）。

- `response`（响应对象）: 用于向客户端发送响应。

使用命令 `node 文件名` 运行服务器。

```bash
$ node test.js
```

此时去访问 `http://127.0.0.1:8080/` ，会看到服务器返回的响应内容出现了乱码。

![202407101116370](https://tecent-oss-shanghai.eaveluo.com/img/202407101116370.png?imageSlim)

这是因为浏览器默认使用了不支持中文字符的编码方式，导致中文内容乱码了，解决方法是设置响应头部的`Content-Type`字段。

```javascript
const http = require('http');

// 创建服务器
const server = http.createServer((request, response) => {
  // highlight-start
  // 设置响应头部的 Content-Type 字段
  response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  // highlight-end
  // 响应内容
  response.end('你好，http!\n');
});

// 服务器监听端口8080
server.listen(8080, () => {
  console.log('服务器运行在 http://127.0.0.1:8080/');
});
```

再次运行服务器，访问 `http://127.0.0.1:8080/` ，可以看到浏览器显示的响应内容是正常的。

![202407101116564](https://tecent-oss-shanghai.eaveluo.com/img/202407101116564.png?imageSlim)

### 手动关闭 HTTP 服务器

当服务启动后，更新代码 `必须重启服务才能生效`。

按住 `Ctrl + C` 组合键可以手动关闭 HTTP 服务器。

### 端口占用问题

如果端口号被占用，会提示 `listen EADDRINUSE: address already in use 127.0.0.1:8080`。

解决方法：

- 杀死占用端口的进程。
- 尝试其他端口号 **（推荐）**。

### 获取 HTTP 请求报文 / 设置 HTTP 响应报文

`request` 对象提供了一些方法和属性用于获取 HTTP 请求报文。

- `request.url`：获取请求的 URL。
- `request.method`：获取请求的方法。
- `request.headers`：获取请求的头部信息。
- `request.on('data', callback)`：监听数据流事件。
- `request.on('end', callback)`：监听数据流结束事件。
- `request.httpVersion`：获取 HTTP 版本。

`response` 对象提供了一些方法和属性用于设置 HTTP 响应报文。

- `response.write(data)`：向响应主体中写入数据。
- `response.end(data)`：结束响应，并可选地写入数据。
- `response.setHeader(name, value)`：设置响应头部字段。
- `response.statusCode`：设置响应状态码。
- `response.statusMessage`：设置响应状态短语 **（这块有默认值的，一般不会设置）** 。

下面模拟一个简单的登录注册页面，根据请求的 URL 和方法，返回不同的响应内容。

:::tip 提示

目前只介绍简单的使用，为了方便看效果，此处 method 都采用 GET 请求（浏览器默认发的就是 GET 请求，如果要发送 POST 请求，需要设置请求头部的`Content-Type`字段），后续在接口开发时会详细介绍。

:::

```javascript
const http = require('http');

// 创建服务器
const server = http.createServer((request, response) => {
  let { url, method } = request; //对象的解构赋值
  //设置响应头信息
  //解决中文乱码
  response.setHeader('Content-Type', 'text/html;charset=utf-8');
  if (url == '/register' && method == 'GET') {
    response.end('注册页面');
  } else if (url == '/login' && method == 'GET') {
    response.end('登录页面');
  } else {
    response.end('<h1>404 Not Found</h1>');
  }
});

// 服务器监听端口8080
server.listen(8080, () => {
  console.log('服务器运行在 http://127.0.0.1:8080/');
});
```

运行服务器，访问 `http://127.0.0.1:8080/register` 和 `http://127.0.0.1:8080/login`，可以看到不同的响应内容。

- 404 Not Found：请求的 URL 为 `/` ,因此返回 404 页面。
  ![202407101207593](https://tecent-oss-shanghai.eaveluo.com/img/202407101207593.png?imageSlim)

- 注册页面：请求的 URL 是 `/register` ，请求的方法是 `GET`，因此返回注册页面。
  ![202407101208357](https://tecent-oss-shanghai.eaveluo.com/img/202407101208357.png?imageSlim)

- 登录页面：请求的 URL 是 `/login` ，请求的方法是 `GET`，因此返回登录页面。
  ![202407101208714](https://tecent-oss-shanghai.eaveluo.com/img/202407101208714.png?imageSlim)
