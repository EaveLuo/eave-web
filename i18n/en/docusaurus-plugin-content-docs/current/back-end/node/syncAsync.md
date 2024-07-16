---
sidebar_position: 5
slug: sync-async
title: Sync and Asynchrony
description: The difference between synchronous and asynchronous methods and their reasons, as well as how to choose to use synchronous or asynchronous methods in Node.js.
tags: [Node.js, JavaScript, Sync, Asynchrony]
keywords:
  - Node.js
  - JavaScript
  - Sync
  - Asynchrony
---

Before opening the core module of Node.js, let's talk about the concepts of synchronization and asynchrony. These two concepts will be involved in subsequent articles. If you don't know much about these two concepts, you can read this article first. Please bypass it.

## What is synchronization and asynchrony?

Node.js provides two ways, synchronous and asynchronous, to perform file system operations and other I/O operations. Understanding the difference between them and their application scenarios is very important for the efficient use of Node.js.

## Difference between synchronous and asynchronous methods

1. **Synchronous Methods**

- Synchronous methods block the execution of code until the operation is completed. This means that the program will not execute subsequent code until the synchronous operation is completed.

- If the operation takes a long time (such as reading a large file), it will cause the program to stagnate and unable to process other tasks.

- There is usually no explicit identification in the method name, but the synchronous methods provided by Node.js generally end with `Sync`.

**Example: Reading a file synchronously**

```javascript
const fs = require('fs');

try {
  const data = fs.readFileSync('example.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error(err);
}
console.log('This print will be executed after reading the file.');
```

2. **Asynchronous Methods**

- Asynchronous methods do not block the execution of code. Instead, they return immediately and notify you when the operation is complete through callback functions, promises, or async/await.
- Asynchronous methods allow the program to continue to perform other tasks while waiting for the I/O operation to complete, so they are suitable for handling high concurrency and I/O-intensive operations.
- Asynchronous methods handle the logic after the operation is completed through callback functions, promises, or async/await.

**Example: Reading a file asynchronously**

```javascript
const fs = require('fs');

fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
console.log('This print will be executed before reading the file.');
```

## Why do we have synchronous and asynchronous methods

1. **Performance and concurrency**

- **Asynchronous methods**: Node.js was originally designed to build high-performance network applications, and achieve high concurrency processing through event-driven and non-blocking I/O models. Asynchronous methods allow Node.js to process I/O operations without blocking the execution of other tasks, thereby improving performance and responsiveness.

- **Synchronous methods**: Although asynchronous methods have better performance, synchronous methods are still useful in some cases. For example, when reading configuration files or performing initialization tasks when starting a script, using synchronous methods can ensure that tasks are executed in order and simplify code logic.

2. **Code complexity**

- Asynchronous programming may increase the complexity of the code in some cases, especially when there are multiple asynchronous operations that need to be executed in sequence or depend on each other. Using Promise and async/await can simplify the writing of asynchronous code, but in some simple scenarios, using synchronous methods can be easier to understand and maintain.

## Choose to use synchronous or asynchronous methods

- **Use asynchronous methods**: When your application needs to handle a large number of concurrent requests and perform I/O intensive operations (such as reading files, database queries, and network requests), asynchronous methods are the best choice because they can improve the performance and responsiveness of the application.
- **Use synchronous methods**: In tasks that need to be executed in sequence, such as application initialization and configuration loading, using synchronous methods can simplify code logic and ensure that operations are completed in sequence.

In short, Node.js provides both synchronous and asynchronous methods to meet the needs of different scenarios. Asynchronous methods use event-driven and non-blocking I/O models to achieve high performance and high concurrency processing, while synchronous methods provide simple and easy-to-use solutions in some tasks that need to be executed sequentially.
