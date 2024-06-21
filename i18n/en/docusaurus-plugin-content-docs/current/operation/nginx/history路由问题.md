---
sidebar_position: 1
slug: history-router-problem
title: history routing problem
tags: [nginx, history routing, hash routing]
keywords:
  - nginx
  - history routing
  - hash routing
---

The problem that nginx in `history` routing mode cannot match the routing of the project.

### Preface

Modern front-end engineering projects generally use the history routing mode or the hash routing mode. The history routing mode is based on the HTML5 [`History API`](https://developer.mozilla.org/docs/Web/API/History) , while the hash routing mode is based on the hash value of the [`URL API`](https://developer.mozilla.org/docs/Web/API/URL) .

The two are applicable to different scenarios. The `history` routing mode is suitable for multi-page applications (MPA), especially applications with SEO requirements, while the `hash` routing mode is suitable for single-page applications (SPA), such as the classic backend management system.

When deploying modern front-end engineering projects, you need to choose the `history` routing mode or the `hash` routing mode according to the actual situation, and adjust the project's routing configuration accordingly.

### Identify the problem

For the `hash` routing mode, no special configuration is generally required. For the `history` routing mode, the home page route may be opened, but after jumping to other routes and refreshing, the page is lost because nginx cannot match the project route.

### Solution

To solve the problem that nginx in `history` routing mode cannot match the routing of the project, you need to add the following configuration to the nginx configuration file:

```conf title="nginx.conf"
location / {
    try_files $uri $uri/ /index.html; #Solve the problem of history route matching failure
}
```
