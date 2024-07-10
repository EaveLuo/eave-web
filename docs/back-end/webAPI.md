---
sidebar_position: 2
slug: web-api
title: 应用编程接口（API）
description: 网络应用编程接口（Web API）是一种通过网络提供的应用程序编程接口，允许不同的软件系统通过互联网进行通信和数据交换。
tags: [后端, api]
keywords:
  - 后端
  - api
---

Web API 是一种通过网络提供的应用程序编程接口，允许不同的软件系统通过互联网进行通信和数据交换。Web API 通常使用 HTTP 或 HTTPS 协议，可以被各种客户端（如 Web 浏览器、移动应用、桌面应用等）调用，用于访问和操作服务器上的资源或服务。

## Web API 的特点

1. **基于 HTTP/HTTPS 协议**：Web API 使用 HTTP 或 HTTPS 作为通信协议，便于通过互联网进行数据传输。
2. **支持多种数据格式**：Web API 通常支持多种数据格式，最常见的是 JSON 和 XML，这些格式易于解析和处理。
3. **无状态通信**：每个请求都是独立的，服务器不需要记住先前的请求状态。每个请求包含所有必要的信息。
4. **跨平台**：由于使用标准的 HTTP/HTTPS 协议和通用的数据格式，Web API 可以在不同的操作系统和编程语言之间进行交互。

## Web API 的类型

目前主流的 Web API 可以分为以下几类：

1. **RESTful API**：遵循 REST 架构风格的 Web API。
2. **SOAP API**：遵循 SOAP 协议的 Web API。
3. **GraphQL API**：遵循 GraphQL 协议的 Web API。
4. **RPC API**：遵循 RPC 协议的 Web API。

### RPC API

RPC（Remote Procedure Call）是一种通过网络调用远程服务的协议。

#### RPC API 的特点：

- **基于 RPC 协议**：使用 RPC 协议作为通信协议。
- **无状态通信**：服务器不保存客户端的状态，所有状态信息都由客户端保存并在每次请求时传递。
- **支持多种数据格式**：支持多种数据格式，如 JSON、XML、二进制等。

#### 示例：

调用远程服务的示例：

```
POST /rpc HTTP/1.1
Host: api.example.com
Content-Type: application/json


{
  "method": "getUser",
  "params": [123],
  "id": 1
}
```

### SOAP API

SOAP（Simple Object Access Protocol）是一种基于 XML 的协议，用于在网络上交换结构化信息。

#### SOAP API 的特点：

- **基于 XML**：使用 XML 作为消息格式。
- **严格的标准**：包括安全性、事务处理等。
- **更复杂**：相比 REST，SOAP 的实现和解析更复杂。

#### 示例：

SOAP 请求示例（简化版）：

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:example">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:GetUser>
      <urn:UserId>123</urn:UserId>
    </urn:GetUser>
  </soapenv:Body>
</soapenv:Envelope>
```

### GraphQL API

GraphQL（Graph Query Language）是一种用于 API 的查询语言。

#### GraphQL API 的特点：

- **基于 GraphQL 协议**：使用 GraphQL 协议作为通信协议。
- **强类型系统**：GraphQL 具有强类型系统，可以方便地定义数据模型。
- **更灵活**：GraphQL 允许客户端指定所需的数据，可以更灵活地获取数据。

#### 示例：

GraphQL 请求示例（简化版）：

```graphql
query {
  user(id: 123) {
    id
    name
    email
  }
}
```

### RESTful API

REST（Representational State Transfer）是一种架构风格，强调资源的表述和状态转换。RESTful API 是遵循 REST 架构风格的 Web API。

#### RESTful API 的特点：

- **资源导向**：每个资源都通过 URL 唯一标识。
- **使用标准的 HTTP 方法**：如 GET、POST、PUT、DELETE 等。
- **无状态通信**：服务器不保存客户端的状态，所有状态信息都由客户端保存并在每次请求时传递。
- **支持多种数据格式**：最常用的是 JSON。

由于 RESTful API 是目前最流行的 Web API 类型，因此下列再对 RESTful API 遵循的 REST 原则进行简要介绍。

#### RESTful API 遵循的 REST 原则：

- **协议**

  RESTful API 使用 HTTP 协议作为通信协议，如 GET、POST、PUT、DELETE。

- **域名**

  RESTful API 应该尽量使用专用域名，如 api.eaveluo.com。

  如果确定 API 很简单，不会有进一步扩展，可以考虑放在主域名下，如 eaveluo.com/api。

- **版本**

  RESTful API 应该有版本号，如 api.eaveluo.com/v1。

- **路径**

  RESTfulRESTful API 使用名词表示资源，使用动词表示操作，如 /users、/users/:id。

- **HTTP 动词**

  RESTful API 使用 HTTP 动词来表示操作，如 GET、POST、PUT、DELETE。

  - GET：获取资源。
  - POST：创建资源。
  - PUT：更新资源。
  - DELETE：删除资源。

- **过滤**

  如果记录数量很多，服务器不可能都将它们返回给用户。API 应该提供参数，过滤返回结果。

  下面是一些常见的参数：

  - ?limit=10：指定返回记录的数量
  - ?page=8$limit=10：指定第几页，以及每页的记录数。
  - ?sortby=name&order=asc：指定返回结果按照哪个属性排序，以及排序顺序。
  - ?name=Eave Luo：指定筛选条件

- **状态码**

  服务器向用户返回的状态码和提示信息，常见的有以下一些：

  - 200 OK：请求成功。
  - 201 Created：资源创建成功。
  - 204 No Content：请求成功，但没有返回任何内容。
  - 400 Bad Request：请求语法错误。
  - 401 Unauthorized：请求未授权。
  - 403 Forbidden：服务器拒绝请求。
  - 404 Not Found：请求的资源不存在。
  - 500 Internal Server Error：服务器内部错误。

- **错误处理**

  如果状态码是 4xx，就应该向用户返回出错信息。一般来说，返回的信息中将 error 作为键名，出错信息作为键值即可。

  示例：

  ```json
  {
    "error": "User not found"
  }
  ```

- **返回结果**

  服务器向用户返回的结果，应该符合 API 文档中定义的格式。

  示例：

  ```json
  [
    {
      "id": 1,
      "name": "Eave Luo",
      "email": "hi@eaveluo.com"
    },
    {
      "id": 2,
      "name": "Admin",
      "email": "admin@eaveluo.com"
    }
  ]
  ```

#### 示例：

获取所有用户：

```http
GET /users
Host: api.eaveluo.com
```

创建新用户：

```http
POST /users
Host: api.eaveluo.com
Content-Type: application/json

{
  "name": "Eave Luo",
  "email": "hi@eaveluo.com"
}
```

## Web API 的优点

1. **跨平台**：可以在不同的平台和编程语言之间进行通信。
2. **灵活性**：可以用于各种应用场景，如 Web 应用、移动应用、桌面应用等。
3. **可扩展性**：可以根据需求增加新的端点和功能。
4. **易于集成**：使用标准的 HTTP 协议和通用的数据格式，便于与其他系统集成。

## Web API 的应用场景

1. **Web 服务**：通过 Web API 提供后端服务，如用户管理、订单处理等。
2. **移动应用**：移动应用可以通过 Web API 与后端服务器通信，获取和提交数据。
3. **第三方集成**：允许第三方开发者访问和使用你的系统功能，如支付网关、社交媒体 API 等。
4. **物联网**：物联网设备可以通过 Web API 与服务器进行数据交换和远程控制。

## 构建一个简单的 RESTful Web API 示例（使用 Node.js）

下面是一个使用 Node.js 和 Express 框架构建的简单 RESTful Web API 示例：

### 安装 Express

```bash
npm install express
```

### 创建一个简单的 RESTful API

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let users = [
  { id: 1, name: 'Eave Luo', email: 'hi@eaveluo.com' },
  { id: 2, name: 'Admin', email: 'admin@eaveluo.com' },
];

// 获取所有用户
app.get('/users', (req, res) => {
  res.json(users);
});

// 获取指定ID的用户
app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

// 创建新用户
app.post('/users', (req, res) => {
  const user = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email,
  };
  users.push(user);
  res.status(201).json(user);
});

// 更新指定ID的用户
app.put('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');

  user.name = req.body.name;
  user.email = req.body.email;
  res.json(user);
});

// 删除指定ID的用户
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).send('User not found');

  users.splice(userIndex, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
```

通过这个简单的示例，展示了如何使用 Node.js 和 Express 框架创建一个基本的 RESTful Web API，包括基本的 CRUD（创建、读取、更新、删除）操作。
