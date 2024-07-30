---
sidebar_position: 9
slug: modularity
title: 模块化
description: 了解 Node.js 中模块化的概念和使用场景。
tags: [Node.js, 模块化, CommonJS, ES 模块]
keywords:
  - Node.js
  - 模块化
  - CommonJS
  - ES 模块
---

在 Node.js 中，模块化是一个非常重要的概念，它允许开发者将代码分割成多个文件和模块，使得代码更易于管理和复用。Node.js 目前最常用的两种模块系统：CommonJS 和 ES 模块（ESM）。了解这两种模块系统的区别和使用场景，可以帮助开发者更好地组织和管理代码。

## CommonJS 模块

CommonJS 是 Node.js 中最早因为服务器端而设计的模块系统，当时叫 ServerJS，是社区提出的，并非官方模块。使用 `require` 函数来引入模块，使用 `module.exports` 或 `exports` 来导出模块里的成员。默认只支持服务器端，若想在浏览器端使用，需要借助三方库如 Browserify。

### 导出模块

CommonJS 模块导出模块的方式有以下两种：

- `exports`：分别导出单个成员。
- `module.exports`：统一导出多个成员。

:::tip 提示
尽量使用 `module.exports` 导出多个成员，因为它可以让代码更易于理解和维护。`exports` 可以混用，但不建议混用，如果混用时出现了命名冲突，一切以 `module.exports` 为准。
:::

#### exports 分别导出单个成员

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

exports.add = add;
exports.subtract = subtract;
```

以上示例使用两次分别导出，导出了 `add` 和 `subtract` 两个函数。

#### module.exports 统一导出多个成员

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = {
  add,
  subtract,
};
```

以上示例统一导出了 `add` 和 `subtract` 两个函数。

### 引入模块

可以使用 `require` 函数引入模块：

```javascript title="app.js"
const math = require('./math');

console.log(math.add(2, 3)); // 5
console.log(math.subtract(5, 3)); // 2

// 或者
const { add, subtract } = require('./math');

console.log(add(2, 3)); // 5
console.log(subtract(5, 3)); // 2
```

## ES 模块

ES 模块（ESM）是 ECMAScript 组织推出的官方模块系统，使用 `import` 和 `export` 关键字来导入和导出模块。支持浏览器端和服务器端，服务器端默认使用 CommonJS 模块，需要将文件名后缀改为 `.mjs` 或者在 `package.json` 中添加 `"type": "module"` 字段。

### 导出模块

ES 模块导出模块的方式有以下三种：

- `export`：分别导出单个成员。
- `export { member1, member2 }`：统一导出多个成员。
- `export default`：默认导出成员。

#### export 分别导出单个成员

```javascript title="math.js"
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

#### `export { member1, member2 }` 统一导出多个成员

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

export { add, subtract };
```

#### export default 默认导出成员

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

export default {
  add,
  subtract,
};
```

### 引入模块

ES 模块引入模块的方式有以下六种：

- `import * as math from './math.js'`：导入全部（通用）。
- `import { add, subtract } from './math.js'`：命名导入方式导入指定成员（对应的导出方式：分别导出、统一导出）。
- `import math from './math.js'`：默认导入方式导入默认成员（对应的导出方式：默认导出）。
- `import math, { add, subtract } from './math.js'`： 默认导入和命名导入方式混合导入。
- `import('./math.js').then((math) => {... })`：动态导入（通用）。
- `import './math.js'`：不接收任何数据，只执行模块。

#### 导入全部（通用）

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

export { add, subtract };
```

```javascript title="app.js"
import * as math from './math.js';

console.log(math.add(2, 3)); // 5
console.log(math.subtract(5, 3)); // 2
```

:::tip 提示
上面示例中，如果 math.js 使用的是默认导出方法，则需要 math.default.add(2, 3)来调用 add 函数。
:::

#### 命名导入方式导入指定成员（对应的导出方式：分别导出、统一导出）

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export { add };
```

```javascript title="app.js"
import { add, subtract } from './math.js';

console.log(add(2, 3)); // 5
console.log(subtract(5, 3)); // 2
```

#### 默认导入方式导入默认成员（对应的导出方式：默认导出）

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

export default {
  add,
  subtract,
};
```

```javascript title="app.js"
import math from './math.js';

console.log(math.add(2, 3)); // 5
console.log(math.subtract(5, 3)); // 2
```

#### 默认导入和命名导入方式混合导入

```javascript title="math.js"
export function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

export { subtract };

export default multiply;
```

```javascript title="app.js"
import mul, { add, subtract } from './math.js';

console.log(add(2, 3)); // 5
console.log(subtract(5, 2)); // 3
console.log(mul(2, 4)); // 8
```

#### 动态导入（通用）

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

export { add, subtract };
```

```javascript title="app.js"
let condition = false;

// 等待三秒将 condition 置为 true，观察结果
await new Promise((resolve) => {
  setTimeout(() => {
    condition = true;
    resolve();
  }, 3000);
});

if (condition) {
  import('./math.js').then((math) => {
    console.log(math.add(2, 3)); // 5
    console.log(math.subtract(5, 3)); // 2
  });
}
```

#### 不接收任何数据，只执行模块

```javascript title="math.js"
console.log('math.js is executed', Math.random());
```

```javascript title="app.js"
import './math.js';
```

## 区别与限制

### 语法和加载方式

- **CommonJS** 使用 `require` 和 `module.exports` 或 `exports`，动态加载模块，`require` 可以在代码的任何地方调用。

  ```javascript
  if (condition) {
    const moduleA = require('moduleA');
  }
  ```

- **ES 模块** 使用 `import` 和 `export`，静态加载模块，`import` 必须在文件的顶部声明。
  ```javascript
  import moduleA from 'moduleA';
  if (condition) {
    // 使用 moduleA
  }
  ```

### 作用域

- **CommonJS** 模块是单例的，每次 `require` 返回相同的实例。
- **ES 模块** 的导入是实时绑定的，导出的值会跟随源模块的改变而改变。

### `this` 绑定

- **CommonJS** 中 `this` 绑定到当前模块。

  ```javascript
  console.log(this); // 输出 {}
  ```

- **ES 模块** 中 `this` 是 `undefined`。
  ```javascript
  console.log(this); // 输出 undefined
  ```

### 顶层 await

- **CommonJS** 不支持顶层 `await`。
- **ES 模块** 支持顶层 `await`。

### 不能在 ES 模块中使用的 CommonJS API

- `require`：需要使用 `import`。
- `module.exports` 或 `exports`：需要使用 `export`。
- `__filename` 和 `__dirname`：可以使用 `import.meta.url` 来替代。

### 不能在 CommonJS 模块中使用的 ES 模块 API

- `import` 语句：不能在 CommonJS 中直接使用，需要使用 `require`。
- `export` 语句：不能在 CommonJS 中直接使用，需要使用 `module.exports` 或 `exports`。

### 示例：使用 ES 模块 API

#### 使用 `import.meta.url`

可以使用 `import.meta.url` 获取当前模块的 URL。

```javascript
// currentFile.js (ES模块)
console.log(import.meta.url);
```

#### 使用 `import()` 动态导入

可以使用 `import()` 进行动态导入。

```javascript
// main.js (ES模块)
if (condition) {
  import('./moduleA.js').then((moduleA) => {
    // 使用 moduleA
  });
}
```

### 配置 ES 模块

在 Node.js 中默认使用 CommonJS 模块，如果需要使用 ES 模块，有两种方案：

- 使用 `.mjs` 文件扩展名：Node.js 会自动识别 `.mjs` 文件为 ES 模块。

```javascript title="math.mjs"
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

- 使用 `"type": "module"` 字段：在 `package.json` 中添加 `"type": "module"` 字段，Node.js 会自动识别 `package.json` 中 `"type": "module"` 的文件为 ES 模块。

```json title="package.json"
{
  "type": "module"
}
```

## 结论

模块化是 Node.js 中组织代码的关键，它提高了代码的可维护性和复用性。CommonJS 是 Node.js 的默认模块系统，适用于大多数 Node.js 项目，而 ES 模块 是现代 JavaScript 标准，适用于需要与浏览器兼容或使用现代 JavaScript 特性的项目。了解和掌握这两种模块系统的区别和限制，可以更好地开发和管理 Node.js 应用程序。
