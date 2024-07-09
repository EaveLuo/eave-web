---
    sidebar_position: 7
    slug: fs
    title: fs 模块
    description: fs 模块是 Node.js 的核心模块之一，用于与文件系统进行交互。它提供了多种方法来处理文件和目录，包括读取、写入、删除、重命名、监视文件变化等。fs 模块支持同步和异步操作，以满足不同的使用需求。
    tags: [Node.js, fs]
    keywords:
    - Node.js
    - fs
---

`fs` 模块是 Node.js 的核心模块之一，用于与文件系统进行交互。它提供了多种方法来处理文件和目录，包括读取、写入、删除、重命名、监视文件变化等。`fs` 模块支持同步和异步操作，以满足不同的使用需求。

本文将介绍 `fs` 模块的常用方法，包括写入文件、读取文件、文件移动与重命名、删除文件、文件夹操作、监视文件变化等。

## 写入文件

文件写入通俗来说就是将数据写入到文件中，`fs` 模块提供了[同步和异步](/docs/back-end/node/sync-async)写入的方法。

### writeFile 异步写入文件

`fs.writeFile` 方法的基本语法如下：

```javascript
fs.writeFile(path, data, [options], callback);
```

- `path`：要写入的文件路径，可以是相对路径或绝对路径，**必填参数**。
- `data`：要写入文件的内容，可以是字符串或 Buffer，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。
- `callback`：写入完成后的回调函数，接受一个错误参数（ `err` ），如果写入成功则该参数为 `null` ，**必填参数**。

示例代码：

- **写入字符串到文件**

  ```javascript
  const fs = require('fs');

  fs.writeFile('example.txt', 'Hello, Node.js!', (err) => {
    if (err) throw err;
    console.log('File has been saved!');
  });
  ```

- **写入 Buffer 到文件**

  ```javascript
  const fs = require('fs');

  const buffer = Buffer.from('Hello, Buffer!');
  fs.writeFile('example.txt', buffer, (err) => {
    if (err) throw err;
    console.log('Buffer has been saved!');
  });
  ```

- **Options 参数使用**

  ```javascript
  const fs = require('fs');

  const options = {
    encoding: 'utf8',
    mode: 0o666,
    flag: 'w',
  };

  fs.writeFile('example.txt', 'Hello, Node.js!', options, (err) => {
    if (err) throw err;
    console.log('File has been saved!');
  });
  ```

  选项参数详解：

  - `encoding`：指定写入文件的字符编码，默认使用 `utf8` 编码。
  - `mode`：指定文件的权限模式，默认使用 `0o666` 权限。
  - `flag`：指定文件打开模式，默认使用 `w` 打开文件，可选值有：
    - `r`：以只读模式打开文件，如果文件不存在则抛出异常。
    - `r+`：以读写模式打开文件，如果文件不存在则抛出异常。
    - `w`：以写入模式打开文件，如果文件不存在则创建文件。
    - `wx`：以写入模式打开文件，如果文件存在则抛出异常。
    - `w+`：以读写模式打开文件，如果文件不存在则创建文件。
    - `wx+`：以读写模式打开文件，如果文件存在则抛出异常。
    - `a`：以追加模式打开文件，如果文件不存在则创建文件。
    - `ax`：以追加模式打开文件，如果文件存在则抛出异常。
    - `a+`：以读写模式打开文件，如果文件不存在则创建文件。
    - `ax+`：以读写模式打开文件，如果文件存在则抛出异常。

`fs.writeFile` 是 Node.js 中用于异步写入文件的常用方法，具有非阻塞特点，适合在高并发环境中使用。

### writeFileSync 同步写入文件

`fs.writeFileSync` 方法的基本语法如下：

```javascript
fs.writeFileSync(path, data, [options]);
```

- `path`：要写入的文件路径，可以是相对路径或绝对路径，**必填参数**。
- `data`：要写入文件的内容，可以是字符串或 Buffer，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。

其参数上与 `fs.writeFile` 相比没有回调函数，是同步方法，调用后会等待写入完成，待写入完成后才会继续执行后续代码。

示例代码：

- **写入字符串到文件**

  ```javascript
  const fs = require('fs');

  fs.writeFileSync('example.txt', 'Hello, Node.js!');
  console.log('File has been saved!');
  ```

- **写入 Buffer 到文件**

  ```javascript
  const fs = require('fs');

  const buffer = Buffer.from('Hello, Buffer!');
  fs.writeFileSync('example.txt', buffer);
  console.log('Buffer has been saved!');
  ```

  与异步写入文件不同，同步写入文件会阻塞 Node.js 进程，直到写入完成，因此不适合在高并发环境中使用。

`fs.writeFileSync` 是 Node.js 中用于同步写入文件的常用方法，具有阻塞特点，适合在单线程环境中使用。

### appendFile / appendFileSync 追加写入

appendFile 作用是在文件尾部追加内容，只是追加模式下，如果文件不存在则创建文件。

语法和参数与 writeFile 和 writeFileSync 完全相同：

```javascript
fs.appendFile(path, data, [options], callback);
```

```javascript
fs.appendFileSync(path, data, [options]);
```

示例代码：

```javascript
const fs = require('fs');

fs.appendFile('example.txt', 'Hello, Node.js!', (err) => {
  if (err) throw err;
  console.log('File has been saved!');
});
```

```javascript
const fs = require('fs');

fs.appendFileSync('example.txt', 'Hello, Node.js!');
console.log('File has been saved!');
```

上述两段代码的作用是将字符串 "Hello, Node.js!" 追加到文件 example.txt 的末尾。

### createWriteStream 流式写入

**程序打开一个文件是需要消耗资源的** ，流式写入可以减少打开关闭文件的次数，提高效率。

流式写入方式适用于 **大文件写入或者频繁写入** 的场景, writeFile 适合于 **写入频率较低的场景**

`fs.createWriteStream` 方法的基本语法如下：

```javascript
fs.createWriteStream(path, [options]);
```

- `path`：要写入的文件路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。

示例代码：

```javascript
const fs = require('fs');

const writeStream = fs.createWriteStream('example.txt');

writeStream.write('Hello, Node.js!');
writeStream.write('Hello, Node.js!');
writeStream.write('Hello, Node.js!');

writeStream.end();
```

上述代码创建了一个流式写入对象，并写入了三次 "Hello, Node.js!" 到文件 example.txt 中。

### 应用场景

- 日志文件写入：日志文件是系统运行过程中的重要记录，一般需要写入频繁，因此使用流式写入或追加写入更加合适。
- 数据文件写入：数据文件一般都是小文件，写入频率较低，使用同步写入更加合适。
- 配置文件写入：配置文件一般都是小文件，写入频率较低，使用同步写入更加合适。
- 缓存文件写入：缓存文件一般都是大文件，写入频率较高，使用流式写入或追加写入更加合适。

:::tip 提示
当 **`需要持久化保存数据`** 的时候，应该想到 **`文件写入`**
:::

## 读取文件

文件读取通俗来说就是从文件中读取数据，`fs` 模块提供了[同步和异步](/docs/back-end/node/sync-async)读取的方法。

### readFile 异步读取文件

`fs.readFile` 方法的基本语法如下：

```javascript
fs.readFile(path, [options], callback);
```

- `path`：要读取的文件路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。
- `callback`：读取完成后的回调函数，接受两个参数：
  - `err`：如果读取失败，则该参数为错误对象，否则为 `null`。
  - `data`：读取到的内容，如果读取失败，则该参数为 `undefined`。

示例代码：

```javascript
const fs = require('fs');

fs.readFile('example.txt', (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
```

### readFileSync 同步读取文件

`fs.readFileSync` 方法的基本语法如下：

```javascript
fs.readFileSync(path, [options]);
```

- `path`：要读取的文件路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。

其参数上与 `fs.readFile` 相比没有回调函数，是同步方法，调用后会等待读取完成，待读取完成后才会返回读取到的内容。

示例代码：

```javascript
const fs = require('fs');

const data = fs.readFileSync('example.txt');
console.log(data.toString());
```

### createReadStream 流式读取

`fs.createReadStream` 方法的基本语法如下：

```javascript
fs.createReadStream(path, [options]);
```

- `path`：要读取的文件路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。

示例代码：

```javascript
const fs = require('fs');

const readStream = fs.createReadStream('example.txt');

readStream.on('data', (chunk) => {
  console.log(chunk.toString());
});

readStream.on('end', () => {
  console.log('End of file');
});
```

上述代码创建了一个流式读取对象，并监听了数据和结束事件，打印了文件内容。

### 应用场景

- 日志文件读取：日志文件是系统运行过程中的重要记录，一般需要读取频繁，因此使用流式读取更加合适。
- 数据文件读取：数据文件一般都是小文件，读取频率较低，使用同步读取更加合适。
- 配置文件读取：配置文件一般都是小文件，读取频率较低，使用同步读取更加合适。
- 缓存文件读取：缓存文件一般都是大文件，读取频率较高，使用流式读取更加合适。

## 文件移动与重命名

文件移动与重命名是文件操作的常用功能，`fs` 模块提供了 `rename` 和 `renameSync` 方法来实现文件移动与重命名。

### rename 异步移动文件

`fs.rename` 方法的基本语法如下：

```javascript
fs.rename(oldPath, newPath, callback);
```

- `oldPath`：要移动的文件的当前路径，可以是相对路径或绝对路径，**必填参数**。
- `newPath`：要移动或重命名的文件的新路径，可以是相对路径或绝对路径，**必填参数**。
- `callback`：移动或重命名完成后的回调函数，接受一个错误参数（ `err` ），如果移动或重命名成功则该参数为 `null` ，**必填参数**。

示例代码：

```javascript
const fs = require('fs');

fs.rename('example.txt', 'example-new.txt', (err) => {
  if (err) throw err;
  console.log('File has been renamed!');
});
```

### renameSync 同步移动文件

`fs.renameSync` 方法的基本语法如下：

```javascript
fs.renameSync(oldPath, newPath);
```

- `oldPath`：要移动的文件的当前路径，可以是相对路径或绝对路径，**必填参数**。
- `newPath`：要移动或重命名的文件的新路径，可以是相对路径或绝对路径，**必填参数**。

其参数上与 `fs.rename` 相比没有回调函数，是同步方法，调用后会等待移动或重命名完成，待移动或重命名完成后才会继续执行后续代码。

示例代码：

```javascript
const fs = require('fs');

fs.renameSync('example.txt', 'example-new.txt');
console.log('File has been renamed!');
```

## 文件删除

文件删除是文件操作的常用功能，`fs` 模块提供了 `unlink` 和 `unlinkSync` 方法来实现文件删除。

### unlink 异步删除文件

`fs.unlink` 方法的基本语法如下：

```javascript
fs.unlink(path, callback);
```

- `path`：要删除的文件路径，可以是相对路径或绝对路径，**必填参数**。
- `callback`：删除完成后的回调函数，接受一个错误参数（ `err` ），如果删除成功则该参数为 `null` ，**必填参数**。

示例代码：

```javascript
const fs = require('fs');

fs.unlink('example.txt', (err) => {
  if (err) throw err;
  console.log('File has been deleted!');
});
```

### unlinkSync 同步删除文件

`fs.unlinkSync` 方法的基本语法如下：

```javascript
fs.unlinkSync(path);
```

- `path`：要删除的文件路径，可以是相对路径或绝对路径，**必填参数**。

其参数上与 `fs.unlink` 相比没有回调函数，是同步方法，调用后会等待删除完成，待删除完成后才会继续执行后续代码。

示例代码：

```javascript
const fs = require('fs');

fs.unlinkSync('example.txt');
console.log('File has been deleted!');
```

## 文件夹操作

文件夹操作是文件操作的常用功能，包括创建文件夹、删除文件夹、列出文件夹内容等，`fs` 模块提供了 `mkdir` 和 `mkdirSync` 方法来实现文件夹创建，`readdir` 和 `readdirSync` 方法来实现列出文件夹内容，`rmdir` 和 `rmdirSync` 方法来实现文件夹删除。

### mkdir 异步创建文件夹

`fs.mkdir` 方法的基本语法如下：

```javascript
fs.mkdir(path, [options], callback);
```

- `path`：要创建的文件夹路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含权限模式等，可选参数。
  - **`recursive`：是否递归创建，默认为 `false`**。
- `callback`：创建完成后的回调函数，接受一个错误参数（ `err` ），如果创建成功则该参数为 `null` ，**必填参数**。

示例代码：

```javascript
const fs = require('fs');

fs.mkdir('example', (err) => {
  if (err) throw err;
  console.log('Folder has been created!');
});

// 递归创建文件夹
fs.mkdir('example2/sub', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Folder2 has been created!');
});
```

### mkdirSync 同步创建文件夹

`fs.mkdirSync` 方法的基本语法如下：

```javascript
fs.mkdirSync(path, [options]);
```

- `path`：要创建的文件夹路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含权限模式等，可选参数。
  - **`recursive`：是否递归创建，默认为 `false`**。

其参数上与 `fs.mkdir` 相比没有回调函数，是同步方法，调用后会等待创建完成，待创建完成后才会继续执行后续代码。

示例代码：

```javascript
const fs = require('fs');

fs.mkdirSync('example');
console.log('Folder has been created!');

// 递归创建文件夹
fs.mkdirSync('example2/sub', { recursive: true });
console.log('Folder2 has been created!');
```

### readdir 异步列出文件夹内容

`fs.readdir` 方法的基本语法如下：

```javascript
fs.readdir(path, [options], callback);
```

- `path`：要列出的文件夹路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。
- `callback`：列出完成后的回调函数，接受两个参数：
  - `err`：如果列出失败，则该参数为错误对象，否则为 `null`。
  - `files`：列出的文件名数组，如果列出失败，则该参数为 `undefined`。

示例代码：

```javascript
const fs = require('fs');

fs.readdir('example', (err, files) => {
  if (err) throw err;
  console.log(files);
});
```

### readdirSync 同步列出文件夹内容

`fs.readdirSync` 方法的基本语法如下：

```javascript
fs.readdirSync(path, [options]);
```

- `path`：要列出的文件夹路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。

其参数上与 `fs.readdir` 相比没有回调函数，是同步方法，调用后会等待列出完成，待列出完成后才会返回文件名数组。

示例代码：

```javascript
const fs = require('fs');

const files = fs.readdirSync('example');
console.log(files);
```

### rmdir 异步删除文件夹

`fs.rmdir` 方法的基本语法如下：

```javascript
fs.rmdir(path, [options], callback);
```

- `path`：要删除的文件夹路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。
  - **`recursive`：是否递归删除，默认为 `false`**。
- `callback`：删除完成后的回调函数，接受一个错误参数（ `err` ），如果删除成功则该参数为 `null` ，**必填参数**。

示例代码：

```javascript
const fs = require('fs');

fs.rmdir('example', (err) => {
  if (err) throw err;
  console.log('Folder has been deleted!');
});

// 递归删除文件夹
fs.rmdir('example2/sub', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Folder2 has been deleted!');
});
```

### rmdirSync 同步删除文件夹

`fs.rmdirSync` 方法的基本语法如下：

```javascript
fs.rmdirSync(path, [options]);
```

- `path`：要删除的文件夹路径，可以是相对路径或绝对路径，**必填参数**。
- `options`：包含编码、文件模式和标志等，可选参数。
  - **`recursive`：是否递归删除，默认为 `false`**。

其参数上与 `fs.rmdir` 相比没有回调函数，是同步方法，调用后会等待删除完成，待删除完成后才会继续执行后续代码。

示例代码：

```javascript
const fs = require('fs');

fs.rmdirSync('example');
console.log('Folder has been deleted!');

// 递归删除文件夹
fs.rmdirSync('example2/sub', { recursive: true });
console.log('Folder2 has been deleted!');
```

## 查看资源状态

查看资源状态是文件操作的常用功能，`fs` 模块提供了 `stat` 和 `statSync` 方法来实现查看资源状态。

### stat 异步查看资源状态

`fs.stat` 方法的基本语法如下：

```javascript
fs.stat(path, callback);
```

- `path`：要查看的文件或文件夹路径，可以是相对路径或绝对路径，**必填参数**。
- `callback`：查看完成后的回调函数，接受两个参数：
  - `err`：如果查看失败，则该参数为错误对象，否则为 `null`。
  - `stats`：资源状态对象，包含以下属性：
    - `isFile()`：是否为文件。
    - `isDirectory()`：是否为文件夹。
    - `isBlockDevice()`：是否为块设备。
    - `isCharacterDevice()`：是否为字符设备。
    - `isSymbolicLink()`：是否为符号链接。
    - `isFIFO()`：是否为命名管道。
    - `isSocket()`：是否为套接字。
    - `size`：文件大小（字节）。
    - `mode`：文件权限模式。
    - `atime`：上次访问时间。
    - `mtime`：上次修改时间。
    - `ctime`：创建时间。

示例代码：

```javascript
const fs = require('fs');

fs.stat('example.txt', (err, stats) => {
  if (err) throw err;
  console.log(stats);
});
```

### statSync 同步查看资源状态

`fs.statSync` 方法的基本语法如下：

```javascript
fs.statSync(path);
```

- `path`：要查看的文件或文件夹路径，可以是相对路径或绝对路径，**必填参数**。

其参数上与 `fs.stat` 相比没有回调函数，是同步方法，调用后会等待查看完成，待查看完成后才会返回资源状态对象。

示例代码：

```javascript
const fs = require('fs');

const stats = fs.statSync('example.txt');
console.log(stats);
```
