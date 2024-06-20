---
sidebar_position: 1
slug: /operation/nginx/base/history-router-problem
date: 2024-06-20
author: Eave Luo
tags: [nginx, history路由, hash路由]
keywords: [nginx, history路由, hash路由]
---

`history` 路由模式下的 nginx 匹配不到项目的路由问题。

### 前言

现代前端工程化项目一般使用 `history` 路由模式或者 `hash` 路由模式，`history` 路由模式是基于 `HTML5` 的 [`History API`](https://developer.mozilla.org/docs/Web/API/History) 来实现的, 而 hash 路由模式是基于 [`URL API`](https://developer.mozilla.org/docs/Web/API/URL) 的 hash 值来实现的。

两者的适用场景不同，`history` 路由模式适用于多页应用(MPA)，尤其是对 SEO 有要求的应用，而 `hash` 路由模式适用于单页应用(SPA)，例如经典的后台管理系统。

在部署现代前端工程化项目时，需要根据实际情况选择 `history` 路由模式或者 `hash` 路由模式，并相应调整项目的路由配置。

### 问题定位

对于 `hash` 路由模式，一般不需要做特殊配置。而对于 `history` 路由模式，可能存在首页路由能打开，但跳转其他路由后一刷新，页面就丢失了，其 nginx 匹配不到项目的路由。

### 解决方案

解决 `history` 路由模式下的 nginx 匹配不到项目的路由问题，需要在 nginx 配置文件中添加以下配置：

```conf title="nginx.conf"
location / {
    try_files $uri $uri/ /index.html; #解决history路由匹配失败问题
}
```
