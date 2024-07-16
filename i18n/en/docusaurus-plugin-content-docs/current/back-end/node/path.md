---
sidebar_position: 6
slug: path
title: path module
description: The path module of Node.js provides a series of methods for processing file and directory paths, ensuring compatibility when processing paths on different operating systems.
tags: [Node.js, path]
keywords:
  - Node.js
  - path
---

The `path` module is one of the core modules of Node.js, used to process and convert file paths. It provides some practical methods to process file and directory paths, which is particularly useful when processing path issues across platforms.

Before discussing the `path` module, let's first introduce absolute paths and relative paths.

## Path Type

Paths can be divided into absolute paths and relative paths.

Absolute path:

- For example: `/usr/local/bin/node` is an absolute path on a linux system.

- For example: `C:\Users\Administrator\Desktop\Code\eave-web\docs\back-end\node\path.md` is an absolute path on a windows system.

Relative path:

- For example: `./index.js` is the index.js file in the current directory.

- For example: `index.js` is equivalent to the above.

- For example: `../index.js` is the index.js file in the parent directory of the current directory.

## 'Global' variables **filename and **dirname

In Node.js, the 'global' variables `__filename` and `__dirname` represent the file name and directory of the currently executed script.

```javascript
console.log(__filename); // Output: /docs/back-end/node/path.md
console.log(__dirname); // Output: /docs/back-end/node
```

## Import `path` module

Before using the `path` module, you need to import it first:

```javascript
const path = require('path');
```

## Common methods

### path.basename(p, [ext])

- Returns the last part of the path, similar to the `basename` command in Unix.
- `p`: Path string.
- `ext`: Optional parameter, file extension. If provided and the path ends with the extension, the extension will be removed.

```javascript
console.log(path.basename('/foo/bar/baz/asdf/quux.html')); // Output: 'quux.html'
console.log(path.basename('/foo/bar/baz/asdf/quux.html', '.html')); // Output: 'quux'
```

### path.dirname(p)

- Returns the directory portion of a path, similar to the `dirname` command on Unix.
- `p`: The path string.

```javascript
console.log(path.dirname('/foo/bar/baz/asdf/quux.html')); // Output: '/foo/bar/baz/asdf'
```

### path.extname(p)

- Returns the file extension of the path, including the dot (`.`).
- `p`: The path string.

```javascript
console.log(path.extname('/foo/bar/baz/asdf/quux.html')); // Output: '.html'
```

### path.format(pathObject)

- Returns a path string from an object. `pathObject` can contain `dir`, `root`, `base`, `name`, and `ext` properties.

```javascript
const pathObject = {
  dir: '/home/user/dir',
  base: 'file.txt',
};
console.log(path.format(pathObject)); // Output: '/home/user/dir/file.txt'
```

### path.parse(p)

- Returns a path object, containing `root`, `dir`, `base`, `ext`, and `name` properties.

- `p`: path string.

```javascript
const parsedPath = path.parse('/home/user/dir/file.txt');
console.log(parsedPath);
// Output:
// {
// root: '/',
// dir: '/home/user/dir',
// base: 'file.txt',
// ext: '.txt',
// name: 'file'
// }
```

### path.isAbsolute(p)

- Check if the path is an absolute path.
- `p`: path string.

```javascript
console.log(path.isAbsolute('/foo/bar')); // Output: true
console.log(path.isAbsolute('baz/..')); // Output: false
```

### path.join([...paths])

- Join multiple path segments into one path.
- `paths`: multiple path segments.

```javascript
console.log(path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')); // Output: '/foo/bar/baz/asdf'
```

### path.normalize(p)

- Normalizes the path, parsing `..` and `.` segments.

- `p`: The path string.

```javascript
console.log(path.normalize('/foo/bar//baz/asdf/quux/..')); // Output: '/foo/bar/baz/asdf'
```

### path.relative(from, to)

- Returns a relative path from `from` to `to`.

- `from`: The source path.

- `to`: The destination path.

```javascript
console.log(path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')); // Output: '../../impl/bbb'
```

### path.resolve([...paths])

- Resolve a path or path fragment to an absolute path.
- `paths`: Multiple path fragments.

```javascript
console.log(path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')); // Output: '/tmp/subfile'
```

### path.sep

- Provides the platform-specific path fragment separator (`'/'` on Linux and macOS, `'\\'` on Windows).

```javascript
console.log(path.sep); // Output: '/' or '\\'
```

### path.delimiter

- Provides platform-specific path delimiters (`':'` on Linux and macOS, `';'` on Windows).

```javascript
console.log(path.delimiter); // Output: ':' or ';'
```

### Summary

The `path` module of Node.js provides a series of methods for processing file and directory paths, ensuring compatibility when processing paths on different operating systems. The `path` module makes it easy to perform path operations such as concatenation, parsing, normalization, and extracting path information. This is very important for building cross-platform Node.js applications.
