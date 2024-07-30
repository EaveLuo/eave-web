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

In Node.js, modularity is a very important concept, which allows developers to split code into multiple files and modules, making the code easier to manage and reuse. The two most commonly used module systems in Node.js are CommonJS and ES modules (ESM). Understanding the differences and usage scenarios of these two module systems can help developers better organize and manage code.

## CommonJS module

CommonJS is the earliest module system designed for the server side in Node.js. It was called ServerJS at the time. It was proposed by the community and was not an official module. Use the `require` function to introduce modules, and use `module.exports` or `exports` to export members in the module. By default, it only supports the server side. If you want to use it on the browser side, you need to use a third-party library such as Browserify.

### Export module

CommonJS module exports modules in two ways:

- `exports`: export a single member separately.

- `module.exports`: export multiple members uniformly.

:::tip Tips
Try to use `module.exports` to export multiple members, because it makes the code easier to understand and maintain. `exports` can be mixed, but it is not recommended. If there is a naming conflict when mixing, `module.exports` shall prevail.
:::

#### exports export a single member separately

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

The above example uses two separate exports to export the `add` and `subtract` functions.

#### module.exports exports multiple members uniformly

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

The above example uniformly exports the `add` and `subtract` functions.

### Importing modules

You can use the `require` function to import modules:

```javascript title="app.js"
const math = require('./math');

console.log(math.add(2, 3)); // 5
console.log(math.subtract(5, 3)); // 2

// Or
const { add, subtract } = require('./math');

console.log(add(2, 3)); // 5
console.log(subtract(5, 3)); // 2
```

## ES modules

ES modules (ESM) are the official module system introduced by the ECMAScript organization, using the `import` and `export` keywords to import and export modules. Supports browser and server side. The server side uses CommonJS module by default. You need to change the file name suffix to `.mjs` or add `"type": "module"` field in `package.json`.

### Export module

There are three ways to export modules in ES module:

- `export`: export single members separately.

- `export { member1, member2 }`: export multiple members uniformly.

- `export default`: export members by default.

#### export Export individual members separately

```javascript title="math.js"
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

#### `export { member1, member2 }` Unified export of multiple members

```javascript title="math.js"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

export { add, subtract };
```

#### export default Default export member

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

### Import modules

There are six ways to import modules in ES modules:

- `import * as math from './math.js'`: Import all (general).
- `import { add, subtract } from './math.js'`: Import specified members by named import (corresponding export methods: separate export, unified export).
- `import math from './math.js'`: Import default members by default import (corresponding export method: default export).
- `import math, { add, subtract } from './math.js'`: Mix default import and named import.
- `import('./math.js').then((math) => {... })`: Dynamic import (general).
- `import './math.js'`: Do not receive any data, just execute the module.

#### Import all (common)

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

:::tip Tips
In the above example, if math.js uses the default export method, math.default.add(2, 3) is required to call the add function.
:::

#### Importing specified members by named import method (corresponding export method: separate export, unified export)

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

#### Importing default members by default import method (corresponding export method: default export)

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

#### Mixed import of default import and named import

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

#### Dynamic import (general)

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

// Wait for three seconds to set condition to true and observe the result
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

#### Do not receive any data, just execute the module

```javascript title="math.js"
console.log('math.js is executed', Math.random());
```

```javascript title="app.js"
import './math.js';
```

## Differences and limitations

### Syntax and loading methods

- **CommonJS** uses `require` and `module.exports` or `exports` to dynamically load modules. `require` can be called anywhere in the code.

```javascript
if (condition) {
  const moduleA = require('moduleA');
}
```

- **ES module** uses `import` and `export` to statically load modules. `import` must be declared at the top of the file.

```javascript
import moduleA from 'moduleA';
if (condition) {
  // Use moduleA
}
```

### Scope

- **CommonJS** modules are singletons. `require` returns the same instance each time.

- **ES module** imports are live-bound. The exported value changes with the changes in the source module.

### `this` binding

- In **CommonJS**, `this` is bound to the current module.

```javascript
console.log(this); // prints {}
```

- In **ES modules**, `this` is `undefined`.

```javascript
console.log(this); // prints undefined
```

### Top-level await

- **CommonJS** does not support top-level `await`.
- **ES modules** support top-level `await`.

### CommonJS APIs that cannot be used in ES modules

- `require`: requires `import`.

- `module.exports` or `exports`: requires `export`.

- `__filename` and `__dirname`: can use `import.meta.url` instead.

### ES module API cannot be used in CommonJS modules

- `import` statement: cannot be used directly in CommonJS, need to use `require`.

- `export` statement: cannot be used directly in CommonJS, need to use `module.exports` or `exports`.

### Example: Using ES module API

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
    // use moduleA
  });
}
```

### Configure ES modules

In Node.js, CommonJS modules are used by default. If you need to use ES modules, there are two solutions:

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
