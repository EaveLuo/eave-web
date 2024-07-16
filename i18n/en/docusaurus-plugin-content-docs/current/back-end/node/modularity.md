---
sidebar_position: 9
slug: modularity
title: modularity
description: Learn about the concept and usage scenarios of modularity in Node.js.
tags: [Node.js, modularity, CommonJS, ES modules]
keywords:
  - Node.js
  - modularity
  - CommonJS
  - ES modules
---

In Node.js, modularity is a very important concept, which allows developers to split code into multiple files and modules, making the code easier to manage and reuse. Node.js provides two module systems: CommonJS and ES modules (ESM). Understanding the differences and usage scenarios of these two module systems can help developers better organize and manage code.

## CommonJS module

CommonJS is the most commonly used module system in Node.js. Use the `require` function to import modules and use `module.exports` or `exports` objects to export modules.

### Exporting modules

You can use `module.exports` to export a single function or object:

```javascript title="math.js"
module.exports = {
  add: function (a, b) {
    return a + b;
  },
  subtract: function (a, b) {
    return a - b;
  },
};
```

You can also use `exports` to export multiple functions:

```javascript title="math.js"
exports.add = function (a, b) {
  return a + b;
};

exports.subtract = function (a, b) {
  return a - b;
};
```

### Importing modules

You can use the `require` function to import modules:

```javascript title="app.js"
const math = require('./math');

console.log(math.add(2, 3)); // 5
console.log(math.subtract(5, 3)); // 2
```

## ES Modules

ES Modules (ESM) is the official module system for JavaScript, using the `import` and `export` keywords to import and export modules.

### Exporting modules

You can use `export` to export a single function or object:

```javascript title="math.js"
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

You can also use `export default` to export a default function or object:

```javascript title="math.js"
export default {
  add: function (a, b) {
    return a + b;
  },
  subtract: function (a, b) {
    return a - b;
  },
};
```

### Importing modules

You can use the `import` keyword to import modules:

```javascript title="app.js"
import { add, subtract } from './math.js';

console.log(add(2, 3)); // 5
console.log(subtract(5, 3)); // 2
```

You can also import default exports:

```javascript title="app.js"
import math from './math.js';

console.log(math.add(2, 3)); // 5
console.log(math.subtract(5, 3)); // 2
```

## Differences and limitations

### Syntax and loading methods

- **CommonJS** Use `require` and `module.exports` or `exports` to dynamically load modules. `require` can be called anywhere in the code.

```javascript
if (condition) {
  const moduleA = require('moduleA');
}
```

- **ES module** Use `import` and `export` to load modules statically. `import` must be declared at the top of the file.

```javascript
import moduleA from 'moduleA';
if (condition) {
  // use moduleA
}
```

### scope

- **CommonJS** modules are singletons, and `require` returns the same instance each time.
- **ES module** imports are live binding, and the exported value changes as the source module changes.

### `this` binding

- **CommonJS** `this` is bound to the current module.

```javascript
console.log(this); // output {}
```

- **ES module** `this` is `undefined`.

```javascript
console.log(this); // output undefined
```

### top-level await

- **CommonJS** does not support top-level `await`.
- **ES module** supports top-level `await`.

### CommonJS APIs that cannot be used in ES modules

- `require`: use `import` instead.

- `module.exports` or `exports`: use `export` instead.

- `__filename` and `__dirname`: use `import.meta.url` instead.

### ES module APIs that cannot be used in CommonJS modules

- `import` statement: cannot be used directly in CommonJS, use `require` instead.

- `export` statement: cannot be used directly in CommonJS, use `module.exports` or `exports` instead.

### Example: Using ES module APIs

#### Using `import.meta.url`

You can use `import.meta.url` to get the URL of the current module.

```javascript
// currentFile.js (ES module)
console.log(import.meta.url);
```

#### Dynamic import using `import()`

You can use `import()` for dynamic import.

```javascript
// main.js (ES module)
if (condition) {
  import('./moduleA.js').then((moduleA) => {
    // Use moduleA
  });
}
```

### Configure ES module

CommonJS modules are used by default in Node.js. If you need to use ES modules, there are two solutions:

- Use the `.mjs` file extension: Node.js will automatically recognize `.mjs` files as ES modules.

```javascript title="math.mjs"
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

- Use the `"type": "module"` field: Add the `"type": "module"` field in `package.json`, and Node.js will automatically recognize the file with `"type": "module"` in `package.json` as an ES module.

```json title="package.json"
{
  "type": "module"
}
```

## Conclusion

Modularization is the key to organizing code in Node.js, which improves the maintainability and reusability of code. CommonJS is the default module system of Node.js and is suitable for most Node.js projects, while ES modules are modern JavaScript standards suitable for projects that need to be compatible with browsers or use modern JavaScript features. Understanding and mastering the differences and limitations of these two module systems can help you better develop and manage Node.js applications.
