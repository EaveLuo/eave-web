---
    sidebar_position: 6
    slug: path
    title: path 模块
    description: Node.js 的 path 模块提供了一系列用于处理文件和目录路径的方法，确保在不同操作系统上处理路径时的兼容性。
    tags: [Node.js, path]
    keywords:
    - Node.js
    - path
---

`path` 模块是 Node.js 的核心模块之一，用于处理和转换文件路径。它提供了一些实用的方法来处理文件和目录路径，跨平台处理路径问题时特别有用。

在探讨 `path` 模块之前，我们先介绍一下绝对路径和相对路径。

## 路径类型

路径可以分为绝对路径和相对路径。

绝对路径：

- 例如： `/usr/local/bin/node` linux 系统上的绝对路径。
- 例如： `C:\Users\Administrator\Desktop\Code\eave-web\docs\back-end\node\path.md` windows 系统上的绝对路径。

相对路径：

- 例如：`./index.js` 当前目录下的 index.js 文件。
- 例如：`index.js` 等效于上面的写法。
- 例如：`../index.js` 当前目录的上一级目录下的 index.js 文件。

## '全局'变量 __filename 和 __dirname

Node.js 中，'全局'变量 `__filename` 和 `__dirname` 代表当前执行脚本的文件名和所在目录。

```javascript
console.log(__filename); // 输出: /docs/back-end/node/path.md
console.log(__dirname); // 输出: /docs/back-end/node
```

## 引入 `path` 模块

在使用 `path` 模块之前，需要先引入它：

```javascript
const path = require('path');
```

## 常用方法

### path.basename(p, [ext])

    - 返回路径中最后一部分，类似于 Unix 中的 `basename` 命令。
    - `p`：路径字符串。
    - `ext`：可选参数，文件扩展名。如果提供并且路径以该扩展名结尾，则该扩展名会被移除。

    ```javascript
    console.log(path.basename('/foo/bar/baz/asdf/quux.html')); // 输出: 'quux.html'
    console.log(path.basename('/foo/bar/baz/asdf/quux.html', '.html')); // 输出: 'quux'
    ```

### path.dirname(p)

    - 返回路径中目录部分，类似于 Unix 中的 `dirname` 命令。
    - `p`：路径字符串。

    ```javascript
    console.log(path.dirname('/foo/bar/baz/asdf/quux.html')); // 输出: '/foo/bar/baz/asdf'
    ```

### path.extname(p)

    - 返回路径中文件的扩展名，包括点号（`.`）。
    - `p`：路径字符串。

    ```javascript
    console.log(path.extname('/foo/bar/baz/asdf/quux.html')); // 输出: '.html'
    ```

### path.format(pathObject)

    - 从对象返回路径字符串，`pathObject` 中可以包含 `dir`, `root`, `base`, `name`, 和 `ext` 属性。

    ```javascript
    const pathObject = {
    dir: '/home/user/dir',
    base: 'file.txt',
    };
    console.log(path.format(pathObject)); // 输出: '/home/user/dir/file.txt'
    ```

### path.parse(p)

    - 返回路径的对象，包含 `root`, `dir`, `base`, `ext`, 和 `name` 属性。
    - `p`：路径字符串。

    ```javascript
    const parsedPath = path.parse('/home/user/dir/file.txt');
    console.log(parsedPath);
    // 输出:
    // {
    //   root: '/',
    //   dir: '/home/user/dir',
    //   base: 'file.txt',
    //   ext: '.txt',
    //   name: 'file'
    // }
    ```

### path.isAbsolute(p)

    - 判断路径是否为绝对路径。
    - `p`：路径字符串。

    ```javascript
    console.log(path.isAbsolute('/foo/bar')); // 输出: true
    console.log(path.isAbsolute('baz/..')); // 输出: false
    ```

### path.join([...paths])

    - 将多个路径片段连接成一个路径。
    - `paths`：多个路径片段。

    ```javascript
    console.log(path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')); // 输出: '/foo/bar/baz/asdf'
    ```

### path.normalize(p)

    - 规范化路径，解析 `..` 和 `.` 片段。
    - `p`：路径字符串。

    ```javascript
    console.log(path.normalize('/foo/bar//baz/asdf/quux/..')); // 输出: '/foo/bar/baz/asdf'
    ```

### path.relative(from, to)

    - 返回从 `from` 到 `to` 的相对路径。
    - `from`：源路径。
    - `to`：目标路径。

    ```javascript
    console.log(path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')); // 输出: '../../impl/bbb'
    ```

### path.resolve([...paths])

    - 将路径或路径片段解析为绝对路径。
    - `paths`：多个路径片段。

    ```javascript
    console.log(path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')); // 输出: '/tmp/subfile'
    ```

### path.sep

    - 提供平台特定的路径片段分隔符（Linux 和 macOS 上是 `'/'`，Windows 上是 `'\\'`）。

    ```javascript
    console.log(path.sep); // 输出: '/' 或 '\\'
    ```

### path.delimiter

    - 提供平台特定的路径定界符（Linux 和 macOS 上是 `':'`，Windows 上是 `';'`）。
    ```javascript
    console.log(path.delimiter); // 输出: ':' 或 ';'
    ```

### 小结

Node.js 的 `path` 模块提供了一系列用于处理文件和目录路径的方法，确保在不同操作系统上处理路径时的兼容性。通过 `path` 模块，可以轻松地进行路径操作，例如连接、解析、规范化和提取路径信息。这对于构建跨平台的 Node.js 应用程序非常重要。
