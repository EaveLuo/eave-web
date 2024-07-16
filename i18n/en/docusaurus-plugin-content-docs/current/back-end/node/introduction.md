---
sidebar_position: 2
slug: introduction
title: What is Node.js?
description: Node.js is a JavaScript runtime environment based on the Chrome V8 engine that allows JavaScript code to run on the server side. This article will introduce the installation, version management, and usage of Node.js.
tags: [Node.js]
keywords:
  - Node.js
---

:::tip Tips
The subsequent content of this module will be based on the premise of having basic knowledge of javascript. If you are not familiar with javascript, it is recommended to learn the basic knowledge of javascript first.
:::

Node.js is an open source, cross-platform JavaScript runtime environment that allows developers to run JavaScript code on the server side. Created by Ryan Dahl in 2009, it is built on the Chrome V8 JavaScript engine. The design concept of Node.js is to achieve efficient and scalable network applications through an event-driven, non-blocking I/O model. Here are some key features of Node.js:

1. **Event-driven and non-blocking I/O**: Node.js uses an event-driven and non-blocking I/O architecture, which enables it to handle a large number of concurrent connections without blocking threads. It is suitable for I/O-intensive applications such as web servers, real-time applications, etc.

2. **Single-threaded architecture**: Node.js uses a single thread to handle all requests, but it can achieve high concurrency through the event loop mechanism. This is different from the traditional multi-threaded server model and can reduce the overhead of thread context switching.

3. **Package manager (npm)**: Node.js comes with a powerful package manager npm (Node Package Manager), which is one of the world's largest open source library ecosystems, providing millions of open source packages and modules, greatly simplifying the development process.

4. **Cross-platform support**: Node.js can run on multiple operating systems, including Windows, Linux, and macOS.

5. **Full-stack development**: Since Node.js uses JavaScript as the programming language, developers can use the same language for front-end and back-end development, reducing the complexity of learning and project management.

6. **Active community**: Node.js has a large and active community, providing a large number of third-party modules and tool support, and constantly promoting technological progress and the improvement of the ecosystem.

### Typical application scenarios

- Real-time chat application
- RESTful API service
- Data stream processing
- Backend service for single-page application (SPA)
- Backend service for IoT (Internet of Things) device

### Sample code

Here is a simple Node.js server example that shows how to create an HTTP server and respond to requests:

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

This code creates an HTTP server running locally and returns "Hello, World!" when it receives a request.

In short, Node.js has become one of the important tools for modern Web development with its high performance, easy scalability and powerful ecosystem.
