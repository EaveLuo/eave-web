---
sidebar_position: 10
slug: package-manager
title: 包管理器
description: 介绍 Node.js 常用的包管理器 npm、Yarn 和 pnpm 的功能和优缺点。
tags: [Node.js, 包管理器, npm, Yarn, pnpm]
keywords:
  - Node.js
  - 包管理器
  - npm
  - Yarn
  - pnpm
---

在 Node.js 中，常用的包管理器包括 npm、Yarn 和 pnpm。每个包管理器都有其独特的功能和优点，下面详细介绍它们的特点、使用方法、常用命令以及生产依赖与开发依赖的区别。

## npm（Node Package Manager）

### 概述

npm 是 Node.js 默认的包管理器，也是最流行的包管理工具。它允许开发者下载、安装、更新和管理 Node.js 项目中的依赖包。

### 安装与初始化

Node.js 安装包中自带 npm，因此无需额外安装。

初始化一个新的 Node.js 项目：

```bash
npm init
```

或者快速初始化（使用默认设置）：

```bash
npm init -y
```

### 常用命令

- **安装包**

  安装并保存到 `dependencies` 中：

  ```bash
  npm install package-name
  ```

  安装并保存到 `devDependencies` 中：

  ```bash
  npm install package-name --save-dev
  ```

- **卸载包**

  ```bash
  npm uninstall package-name
  ```

- **更新包**

  ```bash
  npm update package-name
  ```

- **全局安装包**

  ```bash
  npm install -g package-name
  ```

- **查看全局安装的包**

  ```bash
  npm list -g --depth=0
  ```

- **查看项目中的包**

  ```bash
  npm list --depth=0
  ```

- **检查过时的包**

  ```bash
  npm outdated
  ```

### 配置文件

`package.json` 文件包含了项目的基本信息、依赖包列表及其他配置。

## Yarn

### 概述

Yarn 是 Facebook、Google、Exponent 和 Tilde 联合开发的一个新的包管理工具。它与 npm 兼容，并且提供了一些改进，如更快的安装速度、更可靠的安装过程和更好的依赖管理。

### 安装与初始化

可以通过 npm 安装 Yarn：

```bash
npm install -g yarn
```

初始化一个新的 Node.js 项目：

```bash
yarn init
```

### 常用命令

- **安装包**

  安装并保存到 `dependencies` 中：

  ```bash
  yarn add package-name
  ```

  安装并保存到 `devDependencies` 中：

  ```bash
  yarn add package-name --dev
  ```

- **卸载包**

  ```bash
  yarn remove package-name
  ```

- **更新包**

  ```bash
  yarn upgrade package-name
  ```

- **全局安装包**

  ```bash
  yarn global add package-name
  ```

- **查看全局安装的包**

  ```bash
  yarn global list
  ```

- **查看项目中的包**

  ```bash
  yarn list --depth=0
  ```

- **检查过时的包**

  ```bash
  yarn outdated
  ```

### 配置文件

`package.json` 文件同样适用于 Yarn。此外，Yarn 还会生成一个 `yarn.lock` 文件，用于锁定依赖包的版本，以确保团队中每个人安装的依赖版本一致。

## pnpm

### 概述

pnpm 是一个快速、高效的包管理器。它与 npm 和 Yarn 兼容，并且通过硬链接和符号链接来减少磁盘空间的占用和安装时间。

### 安装与初始化

可以通过 npm 安装 pnpm：

```bash
npm install -g pnpm
```

初始化一个新的 Node.js 项目：

```bash
pnpm init
```

### 常用命令

- **安装包**

  安装并保存到 `dependencies` 中：

  ```bash
  pnpm add package-name
  ```

  安装并保存到 `devDependencies` 中：

  ```bash
  pnpm add package-name --save-dev
  ```

- **卸载包**

  ```bash
  pnpm remove package-name
  ```

- **更新包**

  ```bash
  pnpm update package-name
  ```

- **全局安装包**

  ```bash
  pnpm add -g package-name
  ```

- **查看全局安装的包**

  ```bash
  pnpm list -g --depth=0
  ```

- **查看项目中的包**

  ```bash
  pnpm list --depth=0
  ```

- **检查过时的包**

  ```bash
  pnpm outdated
  ```

### 配置文件

`package.json` 文件同样适用于 pnpm。pnpm 也会生成一个 `pnpm-lock.yaml` 文件，用于锁定依赖包的版本。

## 生产依赖与开发依赖

在 Node.js 项目中，依赖包通常分为生产依赖（dependencies）和开发依赖（devDependencies）。

### 生产依赖（dependencies）

生产依赖是项目在运行时所需的依赖包。这些包对于项目的核心功能至关重要，通常包含在 `dependencies` 字段中。

安装并保存到生产依赖：

```bash
npm install package-name
yarn add package-name
pnpm add package-name
```

### 开发依赖（devDependencies）

开发依赖是仅在开发环境中使用的依赖包，例如测试框架、构建工具和开发服务器等。这些包不会在生产环境中使用，通常包含在 `devDependencies` 字段中。

安装并保存到开发依赖：

```bash
npm install package-name --save-dev
yarn add package-name --dev
pnpm add package-name --save-dev
```

### 配置文件示例

`package.json` 中的依赖配置：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "jest": "^26.6.3"
  }
}
```

## 比较

### 速度

- **npm**：自带 Node.js，但相对于 Yarn 和 pnpm 安装速度稍慢。
- **Yarn**：使用并行安装和缓存机制，通常比 npm 更快。
- **pnpm**：通过硬链接和符号链接减少磁盘空间和安装时间，速度最快。

### 安全性

- **npm**：默认配置下没有强制性校验。
- **Yarn**：默认会检查每个包的校验和，以确保下载的包没有被篡改。
- **pnpm**：也具有高安全性，通过版本锁定文件确保一致性。

### 依赖管理

- **npm** 和 **Yarn**：使用 `package-lock.json` 和 `yarn.lock` 文件来锁定依赖包的版本。
- **pnpm**：使用 `pnpm-lock.yaml` 文件，且通过独特的硬链接机制管理依赖。

### 命令对比

| 功能         | npm 命令                      | Yarn 命令                      | pnpm 命令                  |
| ------------ | ----------------------------- | ------------------------------ | -------------------------- |
| 初始化项目   | `npm init`                    | `yarn init`                    | `pnpm init`                |
| 安装依赖     | `npm install`                 | `yarn`                         | `pnpm install`             |
| 添加依赖     | `npm install package-name`    | `yarn add package-name`        | `pnpm add package-name`    |
| 删除依赖     | `npm uninstall package-name`  | `yarn remove package-name`     | `pnpm remove package-name` |
| 更新依赖     | `npm update package-name`     | `yarn upgrade package-name`    | `pnpm update package-name` |
| 全局安装依赖 | `npm install -g package-name` | `yarn global add package-name` | `pnpm add -g package-name` |
| 查看全局依赖 | `npm list -g --depth=0`       | `yarn global list`             | `pnpm list -g --depth=0`   |
| 查看本地依赖 | `npm list --depth=0`          | `yarn list --depth=0`          | `pnpm list --depth=0`      |
| 检查过时依赖 | `npm outdated`                | `yarn outdated`                | `pnpm outdated`            |

## 结论

npm、Yarn 和 pnpm 是 Node.js 中最常用的三个包管理器，各有优劣。npm 是 Node.js 默认的包管理器，社区广泛使用和支持。Yarn 提供了一些改进，如更快的安装速度和更好的依赖管理。pnpm 通过高效的磁盘使用和更快的安装速度成为一个强有力的竞争者。开发者可以根据项目需求和团队习惯选择适合的包管理器。了解生产依赖与开发依赖的区别，有助于更好地管理项目依赖和环境。
