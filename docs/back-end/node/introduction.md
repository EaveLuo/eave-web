---
    sidebar_position: 2
    slug: introduction
    title: 什么是 Node.js？
    description: Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境，可以让 JavaScript 代码在服务器端运行。本文将介绍 Node.js 的安装、版本管理、使用等相关知识。
    tags: [Node.js]
    keywords:
    - Node.js
---

Node.js 是一个开源、跨平台的 JavaScript 运行时环境，允许开发者在服务器端运行 JavaScript 代码。由 Ryan Dahl 于 2009 年创建，它基于 Chrome V8 JavaScript 引擎构建。Node.js 的设计理念是通过事件驱动、非阻塞 I/O 模型来实现高效且可扩展的网络应用。以下是一些 Node.js 的关键特点：

1. **事件驱动与非阻塞 I/O**：Node.js 采用了事件驱动和非阻塞 I/O 的架构，使其能够处理大量并发连接而不会造成线程阻塞。适用于 I/O 密集型应用，如 Web 服务器、实时应用等。

2. **单线程架构**：Node.js 使用单线程来处理所有的请求，但通过事件循环机制能够实现高并发处理。这与传统的多线程服务器模型不同，可以减少线程上下文切换的开销。

3. **包管理器 (npm)**：Node.js 附带了一个强大的包管理器 npm（Node Package Manager），这是世界上最大的开源库生态系统之一，提供了数百万个开源的包和模块，极大地简化了开发过程。

4. **跨平台支持**：Node.js 可以在多种操作系统上运行，包括 Windows、Linux 和 macOS。

5. **全栈开发**：由于 Node.js 使用 JavaScript 作为编程语言，开发者可以使用同一种语言进行前后端开发，降低了学习和项目管理的复杂度。

6. **活跃的社区**：Node.js 拥有一个庞大且活跃的社区，提供了大量的第三方模块和工具支持，并不断推动技术进步和生态系统的完善。

### 典型应用场景

- 实时聊天应用
- RESTful API 服务
- 数据流处理
- 单页面应用 (SPA) 的后端服务
- IoT（物联网）设备的后端服务

### 示例代码

以下是一个简单的 Node.js 服务器示例，展示了如何创建一个 HTTP 服务器并响应请求：

```javascript
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

这段代码创建了一个在本地运行的 HTTP 服务器，并在接收到请求时返回 "Hello, World!"。

总之，Node.js 以其高性能、易扩展和强大的生态系统成为现代 Web 开发的重要工具之一。
