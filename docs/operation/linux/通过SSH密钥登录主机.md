---
sidebar_position: 1
slug: ssh-key-login-host
title: 通过SSH密钥登录主机
tags: [linux, ssh]
keywords:
  - linux
  - ssh
---

通过 SSH 密钥登录远程服务器（解决一些用账号密码登录时奇奇怪怪的问题，同时也提高了安全性）

### 前言

在日常工作中，我们经常需要登录到远程服务器进行各种操作，比如查看日志、上传文件、执行命令等等。但是，如果每次都需要输入密码，那岂不是很麻烦，况且密码容易泄露、被盗、被破解导致安全性受到影响等等。

SSH 密钥登录可以解决这个问题，它可以让你只需要一次性上传公钥到远程主机，之后无需输入密码，直接使用 SSH 密钥进行身份验证。

### 准备工作

首先，你需要在你的本地电脑上生成一对密钥，并把公钥上传到远程主机的 `~/.ssh/authorized_keys` 文件中。

```bash
# 在本地电脑上生成密钥对
# ssh-keygen [-t type(加密算法, 默认 rsa)] [-b bits] [-C comment] [文件名]
$ ssh-keygen

# 查看公钥内容
$ cat ~/.ssh/id_rsa.pub

# 手动上传公钥到远程主机的 ~/.ssh/authorized_keys 文件中或者使用 ssh-copy-id 命令
$ ssh-copy-id user@remote_host
```

![202406211504662](https://tecent-oss-shanghai.eaveluo.com/img/202406211504662.png?imageSlim)

![202406211511766](https://tecent-oss-shanghai.eaveluo.com/img/202406211511766.png?imageSlim)

### 登录远程主机

使用终端，输入以下命令登录远程主机：

```bash
# 登录远程主机
$ ssh user@remote_host

# 之后无需输入密码，直接使用 SSH 密钥进行身份验证
```

或使用 shell 工具，例如 Finalshell、Xshell 等，将私钥导入到密钥管理器中:

![202406211509276](https://tecent-oss-shanghai.eaveluo.com/img/202406211509276.png?imageSlim)

### 注意事项

- 密钥登录并不安全，不要把私钥上传到公共的 Git 仓库中或者其他可公开访问的地方。
- 密钥登录并不适用于所有场景，比如需要输入复杂的密码、需要使用 sudo 命令等。
