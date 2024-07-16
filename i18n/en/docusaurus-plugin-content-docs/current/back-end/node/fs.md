---
sidebar_position: 7
slug: fs
title: fs module
description: The fs module is one of the core modules of Node.js and is used to interact with the file system. It provides a variety of methods to handle files and directories, including reading, writing, deleting, renaming, and monitoring file changes. The fs module supports synchronous and asynchronous operations to meet different usage requirements.
tags: [Node.js, fs]
keywords:
  - Node.js
  - fs
---

The `fs` module is one of the core modules of Node.js and is used to interact with the file system. It provides a variety of methods to handle files and directories, including reading, writing, deleting, renaming, and monitoring file changes. The `fs` module supports synchronous and asynchronous operations to meet different usage requirements.

This article will introduce the common methods of the `fs` module, including writing files, reading files, moving and renaming files, deleting files, folder operations, monitoring file changes, etc.

## Write to a file

File writing is to write data to a file. The `fs` module provides [synchronous and asynchronous](/docs/back-end/node/sync-async) writing methods.

### writeFile asynchronously writes files

The basic syntax of the `fs.writeFile` method is as follows:

```javascript
fs.writeFile(path, data, [options], callback);
```

- `path`: The file path to be written, which can be a relative path or an absolute path, **required parameter**.

- `data`: The content to be written to the file, which can be a string or a Buffer, **required parameter**.

- `options`: Contains encoding, file mode, and flags, etc., optional parameters.

- `callback`: The callback function after writing is completed, accepts an error parameter (`err`), if the writing is successful, the parameter is `null`, **required parameter**.

Example code:

- **Write a string to a file**

```javascript
const fs = require('fs');

fs.writeFile('example.txt', 'Hello, Node.js!', (err) => {
  if (err) throw err;
  console.log('File has been saved!');
});
```

- **Write a Buffer to a file**

```javascript
const fs = require('fs');

const buffer = Buffer.from('Hello, Buffer!');
fs.writeFile('example.txt', buffer, (err) => {
  if (err) throw err;
  console.log('Buffer has been saved!');
});
```

- **Options parameter usage**

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

Detailed explanation of option parameters:

- `encoding`: specifies the character encoding of the written file, and `utf8` encoding is used by default.

- `mode`: specifies the permission mode of the file, and `0o666` permission is used by default.

- `flag`: specifies the file opening mode, and `w` is used to open the file by default. The optional values ​​are:

- `r`: Open the file in read-only mode, and throw an exception if the file does not exist.

- `r+`: Open the file in read-write mode, and throw an exception if the file does not exist.

- `w`: Open the file in write mode, and create the file if the file does not exist.

- `wx`: Open the file in write mode, and throw an exception if the file exists.
- `w+`: Open the file in read-write mode, and create the file if it does not exist.
- `wx+`: Open the file in read-write mode, and throw an exception if the file exists.
- `a`: Open the file in append mode, and create the file if it does not exist.
- `ax`: Open the file in append mode, and throw an exception if the file exists.
- `a+`: Open the file in read-write mode, and create the file if it does not exist.
- `ax+`: Open the file in read-write mode, and throw an exception if the file exists.

`fs.writeFile` is a common method in Node.js for asynchronous writing of files. It has non-blocking characteristics and is suitable for use in high-concurrency environments.

### writeFileSync writes files synchronously

The basic syntax of the `fs.writeFileSync` method is as follows:

```javascript
fs.writeFileSync(path, data, [options]);
```

- `path`: The file path to be written, which can be a relative path or an absolute path, **required parameter**.
- `data`: the content to be written to the file, which can be a string or a Buffer, **required parameter**.
- `options`: contains encoding, file mode, and flags, etc., optional parameters.

Compared with `fs.writeFile`, its parameters do not have a callback function. It is a synchronous method. After calling it, it will wait for the writing to be completed, and will continue to execute subsequent code after the writing is completed.

Example code:

- **Write a string to a file**

```javascript
const fs = require('fs');

fs.writeFileSync('example.txt', 'Hello, Node.js!');
console.log('File has been saved!');
```

- **Write a Buffer to a file**

```javascript
const fs = require('fs');

const buffer = Buffer.from('Hello, Buffer!');
fs.writeFileSync('example.txt', buffer);
console.log('Buffer has been saved!');
```

Unlike asynchronous writing to a file, synchronous writing to a file blocks the Node.js process until the writing is complete, so it is not suitable for use in a high-concurrency environment.

`fs.writeFileSync` is a common method in Node.js for synchronously writing to a file. It has a blocking characteristic and is suitable for use in a single-threaded environment.

### appendFile / appendFileSync append writing

appendFile is used to append content to the end of a file. However, in append mode, if the file does not exist, it will be created.

The syntax and parameters are exactly the same as writeFile and writeFileSync:

```javascript
fs.appendFile(path, data, [options], callback);
```

```javascript
fs.appendFileSync(path, data, [options]);
```

Sample code:

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

The above two codes are used to append the string "Hello, Node.js!" Append to the end of the file example.txt.

### createWriteStream Streaming Writing

**Opening a file consumes resources**, and streaming writing can reduce the number of times a file is opened and closed, improving efficiency.

Streaming writing is suitable for **large file writing or frequent writing**, and writeFile is suitable for **lower writing frequency**

The basic syntax of the `fs.createWriteStream` method is as follows:

```javascript
fs.createWriteStream(path, [options]);
```

- `path`: The file path to be written, which can be a relative path or an absolute path, **required parameter**.

- `options`: Contains encoding, file mode, and flags, etc., optional parameters.

Example code:

```javascript
const fs = require('fs');

const writeStream = fs.createWriteStream('example.txt');

writeStream.write('Hello, Node.js!');
writeStream.write('Hello, Node.js!');

writeStream.write('Hello, Node.js!');

writeStream.end();
```

The above code creates a stream writing object and writes "Hello, Node.js!" three times to the file example.txt.

### Application scenarios

- Log file writing: Log files are important records of system operation and generally need to be written frequently, so it is more appropriate to use stream writing or append writing.
- Data file writing: Data files are generally small files with low writing frequency, so it is more appropriate to use synchronous writing.
- Configuration file writing: Configuration files are generally small files with low writing frequency, so it is more appropriate to use synchronous writing.
- Cache file writing: Cache files are generally large files with a high writing frequency, so it is more appropriate to use streaming writing or appending writing.

:::tip Tips
When **`need to persist data`**, you should think of **`file writing`**
:::

## Reading files

File reading is generally speaking reading data from a file. The `fs` module provides [synchronous and asynchronous](/docs/back-end/node/sync-async) reading methods.

### readFile asynchronously reads files

The basic syntax of the `fs.readFile` method is as follows:

```javascript
fs.readFile(path, [options], callback);
```

- `path`: The file path to be read, which can be a relative path or an absolute path, **required parameter**.

- `options`: Contains encoding, file mode, and flags, etc., optional parameters.
- `callback`: callback function after reading is completed, accepts two parameters:
- `err`: if reading fails, this parameter is an error object, otherwise it is `null`.
- `data`: the content read, if reading fails, this parameter is `undefined`.

Example code:

```javascript
const fs = require('fs');

fs.readFile('example.txt', (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
```

### readFileSync synchronously reads files

The basic syntax of the `fs.readFileSync` method is as follows:

```javascript
fs.readFileSync(path, [options]);
```

- `path`: The file path to be read, which can be a relative path or an absolute path, **required parameter**.
- `options`: Contains encoding, file mode and flags, etc., optional parameters.

Compared with `fs.readFile`, its parameters do not have a callback function. It is a synchronous method. After calling, it will wait for the reading to be completed, and will return the read content after the reading is completed.

Example code:

```javascript
const fs = require('fs');

const data = fs.readFileSync('example.txt');
console.log(data.toString());
```

### createReadStream streaming reading

The basic syntax of the `fs.createReadStream` method is as follows:

```javascript
fs.createReadStream(path, [options]);
```

- `path`: The file path to be read, which can be a relative path or an absolute path, **required parameter**.
- `options`: Contains encoding, file mode and flags, etc., optional parameters.

Example code:

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

The above code creates a stream reading object, listens to data and end events, and prints the file content.

### Application scenarios

- Log file reading: Log files are important records of system operation and generally need to be read frequently, so it is more appropriate to use stream reading.

- Data file reading: Data files are generally small files with low reading frequency, so it is more appropriate to use synchronous reading.

- Configuration file reading: Configuration files are generally small files with low reading frequency, so it is more appropriate to use synchronous reading.

- Cache file reading: Cache files are generally large files with high reading frequency, so it is more appropriate to use stream reading.

## File moving and renaming

File moving and renaming are common functions of file operations. The `fs` module provides `rename` and `renameSync` methods to implement file moving and renaming.

### rename asynchronous file moving

The basic syntax of the `fs.rename` method is as follows:

```javascript
fs.rename(oldPath, newPath, callback);
```

- `oldPath`: The current path of the file to be moved, which can be a relative path or an absolute path, **required parameter**.

- `newPath`: The new path of the file to be moved or renamed, which can be a relative path or an absolute path, **required parameter**.

- `callback`: The callback function after the move or rename is completed, accepting an error parameter (`err`). If the move or rename is successful, the parameter is `null`, **required parameter**.

Example code:

```javascript
const fs = require('fs');

fs.rename('example.txt', 'example-new.txt', (err) => {
  if (err) throw err;
  console.log('File has been renamed!');
});
```

### renameSync Synchronous file movement

The basic syntax of the `fs.renameSync` method is as follows:

```javascript
fs.renameSync(oldPath, newPath);
```

- `oldPath`: The current path of the file to be moved, which can be a relative path or an absolute path, **required parameter**.

- `newPath`: The new path of the file to be moved or renamed, which can be a relative path or an absolute path, **required parameter**.

Compared with `fs.rename`, its parameters do not have a callback function. It is a synchronous method. After calling, it will wait for the move or rename to be completed. Only after the move or rename is completed will the subsequent code be executed.

Example code:

```javascript
const fs = require('fs');

fs.renameSync('example.txt', 'example-new.txt');
console.log('File has been renamed!');
```

## File deletion

File deletion is a common function of file operation. The `fs` module provides `unlink` and `unlinkSync` methods to implement file deletion.

### unlink asynchronously delete files

The basic syntax of the `fs.unlink` method is as follows:

```javascript
fs.unlink(path, callback);
```

- `path`: The file path to be deleted, which can be a relative path or an absolute path, **required parameter**.

- `callback`: The callback function after the deletion is completed, accepting an error parameter (`err`). If the deletion is successful, the parameter is `null`, **required parameter**.

Example code:

```javascript
const fs = require('fs');

fs.unlink('example.txt', (err) => {
  if (err) throw err;
  console.log('File has been deleted!');
});
```

### unlinkSync Synchronous file deletion

The basic syntax of the `fs.unlinkSync` method is as follows:

```javascript
fs.unlinkSync(path);
```

- `path`: The file path to be deleted, which can be a relative path or an absolute path, **required parameter**.

Compared with `fs.unlink`, its parameters do not have a callback function. It is a synchronous method. After calling, it will wait for the deletion to be completed, and will continue to execute subsequent code after the deletion is completed.

Example code:

```javascript
const fs = require('fs');

fs.unlinkSync('example.txt');
console.log('File has been deleted!');
```

## Folder operation

Folder operation is a common function of file operation, including creating folders, deleting folders, listing folder contents, etc. The `fs` module provides `mkdir` and `mkdirSync` methods to implement folder creation, `readdir` and `readdirSync` methods to implement folder content listing, and `rmdir` and `rmdirSync` methods to implement folder deletion.

### mkdir asynchronously creates folders

The basic syntax of the `fs.mkdir` method is as follows:

```javascript
fs.mkdir(path, [options], callback);
```

- `path`: The folder path to be created, which can be a relative path or an absolute path, **required parameter**.

- `options`: Contains permission mode, etc., optional parameters.
- **`recursive`: whether to create recursively, default is `false`**.
- `callback`: callback function after creation, accepts an error parameter (`err`), if creation is successful, the parameter is `null`, **required parameter**.

Example code:

```javascript
const fs = require('fs');

fs.mkdir('example', (err) => {
  if (err) throw err;
  console.log('Folder has been created!');
});

// Recursively create folders
fs.mkdir('example2/sub', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Folder2 has been created!');
});
```

### mkdirSync Synchronously create folders

The basic syntax of the `fs.mkdirSync` method is as follows:

```javascript
fs.mkdirSync(path, [options]);
```

- `path`: The path of the folder to be created, which can be a relative path or an absolute path, **required parameter**.

- `options`: Contains permission mode, etc., optional parameters.
- **`recursive`: whether to create recursively, the default is `false`**.

Compared with `fs.mkdir`, its parameters do not have a callback function. It is a synchronous method. After calling it, it will wait for the creation to be completed, and will continue to execute subsequent codes after the creation is completed.

Example code:

```javascript
const fs = require('fs');

fs.mkdirSync('example');
console.log('Folder has been created!');

// Create folders recursively
fs.mkdirSync('example2/sub', { recursive: true });
console.log('Folder2 has been created!');
```

### readdir asynchronously lists folder contents

The basic syntax of the `fs.readdir` method is as follows:

```javascript
fs.readdir(path, [options], callback);
```

- `path`: The folder path to be listed, which can be a relative path or an absolute path, **required parameter**.

- `options`: Contains encoding, file mode, and flags, etc., optional parameters.

- `callback`: The callback function after the listing is completed, accepting two parameters:

- `err`: If the listing fails, this parameter is an error object, otherwise it is `null`.
- `files`: array of listed file names. If the listing fails, the parameter is `undefined`.

Example code:

```javascript
const fs = require('fs');

fs.readdir('example', (err, files) => {
  if (err) throw err;
  console.log(files);
});
```

### readdirSync Synchronously list folder contents

The basic syntax of the `fs.readdirSync` method is as follows:

```javascript
fs.readdirSync(path, [options]);
```

- `path`: the folder path to be listed, which can be a relative path or an absolute path, **required parameter**.

- `options`: includes encoding, file mode, flags, etc., optional parameters.

Compared with `fs.readdir`, its parameters do not have a callback function. It is a synchronous method. After calling, it will wait for the listing to be completed, and will return the file name array after the listing is completed.

Example code:

```javascript
const fs = require('fs');

const files = fs.readdirSync('example');
console.log(files);
```

### rmdir asynchronously delete folders

The basic syntax of the `fs.rmdir` method is as follows:

```javascript
fs.rmdir(path, [options], callback);
```

- `path`: The folder path to be deleted, which can be a relative path or an absolute path, **required parameter**.

- `options`: Contains encoding, file mode, and flags, etc., optional parameters.
- **`recursive`: Whether to recursively delete, the default is `false`**.

- `callback`: The callback function after the deletion is completed, accepting an error parameter (`err`), if the deletion is successful, the parameter is `null`, **required parameter**.

Example code:

```javascript
const fs = require('fs');

fs.rmdir('example', (err) => {
  if (err) throw err;
  console.log('Folder has been deleted!');
});

// Recursively delete folders
fs.rmdir('example2/sub', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Folder2 has been deleted!');
});
```

### rmdirSync Synchronous Delete Folders

The basic syntax of the `fs.rmdirSync` method is as follows:

```javascript
fs.rmdirSync(path, [options]);
```

- `path`: The folder path to be deleted, which can be a relative path or an absolute path, **required parameter**.

- `options`: Contains encoding, file mode and flags, etc., optional parameters.
- **`recursive`: Whether to delete recursively, the default is `false`**.

Compared with `fs.rmdir`, its parameters do not have a callback function. It is a synchronous method. After calling, it will wait for the deletion to be completed, and then continue to execute the subsequent code.

Example code:

```javascript
const fs = require('fs');

fs.rmdirSync('example');
console.log('Folder has been deleted!');

// Recursively delete folders
fs.rmdirSync('example2/sub', { recursive: true });
console.log('Folder2 has been deleted!');
```

## View resource status

Viewing resource status is a common function of file operations. The `fs` module provides `stat` and `statSync` methods to view resource status.

### stat asynchronously view resource status

The basic syntax of the `fs.stat` method is as follows:

```javascript
fs.stat(path, callback);
```

- `path`: the path of the file or folder to be viewed, which can be a relative path or an absolute path, **required parameter**.

- `callback`: the callback function after the view is completed, accepting two parameters:

- `err`: if the view fails, the parameter is an error object, otherwise it is `null`.

- `stats`: resource status object, containing the following properties:

- `isFile()`: whether it is a file.

- `isDirectory()`: whether it is a folder.

- `isBlockDevice()`: whether it is a block device.

- `isCharacterDevice()`: whether it is a character device.

- `isSymbolicLink()`: whether it is a symbolic link.

- `isFIFO()`: whether it is a named pipe.

- `isSocket()`: whether it is a socket.

- `size`: file size (bytes).
- `mode`: file permission mode.
- `atime`: last access time.
- `mtime`: last modification time.
- `ctime`: creation time.

Example code:

```javascript
const fs = require('fs');

fs.stat('example.txt', (err, stats) => {
  if (err) throw err;
  console.log(stats);
});
```

### statSync Synchronous viewing of resource status

The basic syntax of the `fs.statSync` method is as follows:

```javascript
fs.statSync(path);
```

- `path`: the file or folder path to be viewed, which can be a relative path or an absolute path, **required parameter**.

Compared with `fs.stat`, its parameters do not have a callback function. It is a synchronous method. After calling, it will wait for the viewing to be completed, and the resource status object will be returned after the viewing is completed.

Example code:

```javascript
const fs = require('fs');

const stats = fs.statSync('example.txt');
console.log(stats);
```
