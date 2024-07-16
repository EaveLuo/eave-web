---
sidebar_position: 3
slug: installation
title: Installation and version management
description: How to install Node.js and how to use the Node.js version management tool for version management.
tags: [Node.js, nvm]
keywords:
  - Node.js
  - nvm
  - installation
  - version management
---

Below we will introduce how to install and manage Node.js from multiple channels:

## Installation using the official installation package

Download the installation package for the corresponding operating system from the [Node.js official website](https://nodejs.org/zh-cn/download/prebuilt-installer), and then follow the prompts to install it step by step.

It is recommended to download the LTS version, which is the long-term support version (Long-Term Support, LTS).

After installation, it can be used out of the box without configuring environment variables.

## Install using NVM

[NVM (Node Version Manager)](https://github.com/nvm-sh/nvm) is the most popular Node.js version management tool on the market. It can easily install, switch, and delete different versions of Node.js.

> NVM was originally used more in Linux and macOS environments. NVM does not officially support Windows. Later, [Corey Butler](https://github.com/coreybutler) launched and open-sourced [nvm-windows](https://github.com/coreybutler/nvm-windows), which can easily use NVM in Windows environment.

### Install NVM-Windows

First, download the [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) installation package and unzip it to any directory.

Double-click the installation package, and the environment variables will be automatically configured during the installation process.

### Common commands

Install the latest LTS version of Node.js:

```bash
nvm install latest
```

Install a specified version of Node.js:

```bash
nvm install 20
```

Switch to a specified version of Node.js:

```bash
nvm use 20
```

Delete a specified version of Node.js:

```bash
nvm uninstall 20
```

View installed Node.js versions:

```bash
nvm list
```

View the currently used Node.js version:

```bash
nvm current
```

For more commands, please use `nvm --help` to view or refer to the [official documentation](https://github.com/nvm-sh/nvm).
