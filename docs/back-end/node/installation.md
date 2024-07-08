---
    sidebar_position: 3
    slug: installation
    title: 安装与版本管理
    description: 如何安装 Node.js，以及如何使用Node.js版本管理工具进行版本管理。
    tags: [Node.js, nvm]
    keywords:
    - Node.js
    - nvm
    - 安装
    - 版本管理
---

下面我们将介绍如何从多途径安装和管理 Node.js：

## 官方安装包方式安装

在[Node.js 官方网站](https://nodejs.org/zh-cn/download/prebuilt-installer)下载对应操作系统的安装包，然后按照提示一步步安装即可。

推荐下载 LTS 版本，即长期支持版本（Long-Term Support，LTS）。

安装好后开箱即用，无需再配置环境变量。

## 使用 NVM 安装

[NVM（Node Version Manager）](https://github.com/nvm-sh/nvm)是目前市面上最流行的 Node.js 版本管理 工具，可以方便地安装、切换、删除不同版本的 Node.js。

> NVM 原本更多用在 Linux 和 macOS 环境，NVM 官方不支持 Windows，后来[Corey Butler](https://github.com/coreybutler)大神推出并开源了[nvm-windows](https://github.com/coreybutler/nvm-windows)，可以方便地在 Windows 环境下使用 NVM。

### 安装 NVM-Windows

首先，下载[nvm-windows](https://github.com/coreybutler/nvm-windows/releases)安装包，解压到任意目录。

双击安装包，安装过程会自动配置环境变量。

### 常用命令

安装最新 LTS 版本的 Node.js：

```bash
nvm install latest
```

安装指定版本的 Node.js：

```bash
nvm install 20
```

切换到指定版本的 Node.js：

```bash
nvm use 20
```

删除指定版本的 Node.js：

```bash
nvm uninstall 20
```

查看已安装的 Node.js 版本：

```bash
nvm list
```

查看当前正在使用的 Node.js 版本：

```bash
nvm current
```

更多命令请使用 `nvm --help` 查看或参考[官方文档](https://github.com/nvm-sh/nvm)。
