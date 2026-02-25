---
sidebar_position: 1
title: Docusaurus 入门
description: Docusaurus 基础使用和配置指南
---

# Docusaurus 入门

Docusaurus 是一个基于 React 的静态网站生成器，专为文档和博客设计。

## 🚀 快速开始

### 安装

```bash
npx create-docusaurus@latest my-website classic
cd my-website
npm run start
```

### 项目结构

```
my-website/
├── blog/                 # 博客文章
├── docs/                 # 文档
├── src/
│   ├── components/       # 自定义组件
│   ├── css/              # 自定义样式
│   ├── pages/            # 自定义页面
│   └── theme/            # 主题覆盖
├── static/               # 静态资源
├── docusaurus.config.js  # 主配置文件
├── sidebars.js           # 侧边栏配置
└── package.json
```

## 📝 编写文档

### Markdown 基础

```md
# 标题

这是段落文本。

## 代码块

\`\`\`tsx
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`

## 列表

- 项目 1
- 项目 2
  - 子项目

## 链接

[外部链接](https://example.com)
[内部链接](./other-doc.md)
```

### MDX 扩展

Docusaurus 支持 MDX，可以在 Markdown 中使用 React 组件：

```mdx
import MyComponent from '@site/src/components/MyComponent';

# 标题

<MyComponent prop="value" />
```

## ⚙️ 配置

### docusaurus.config.js

```js
module.exports = {
  title: '我的网站',
  tagline: '网站描述',
  url: 'https://your-domain.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
  },
  
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/user/repo/tree/main',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/user/repo/tree/main',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
```

### 侧边栏配置

```js
module.exports = {
  mySidebar: [
    'intro',
    {
      type: 'category',
      label: '教程',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
};
```

## 🎨 主题定制

### 自定义 CSS

在 `src/css/custom.css` 中覆盖样式：

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-font-family-base: 'Inter', system-ui, sans-serif;
}
```

### 覆盖组件

创建 `src/theme/ComponentName/index.tsx` 来覆盖默认组件：

```tsx
import OriginalNavbar from '@theme-original/Navbar';
import type NavbarType from '@theme/Navbar';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof NavbarType>;

export default function Navbar(props: Props): JSX.Element {
  return (
    <>
      <OriginalNavbar {...props} />
      {/* 自定义内容 */}
    </>
  );
}
```

## 📦 插件

### 官方插件

- `@docusaurus/plugin-content-blog` - 博客功能
- `@docusaurus/plugin-content-docs` - 文档功能
- `@docusaurus/plugin-sitemap` - 站点地图
- `@docusaurus/theme-search-algolia` - Algolia 搜索

### 常用社区插件

- `docusaurus-plugin-image-zoom` - 图片缩放
- `@docusaurus/theme-live-codeblock` - 实时代码预览
- `@giscus/react` - Giscus 评论

## 🚢 部署

### Vercel

```bash
npm run build
vercel deploy
```

### GitHub Pages

```bash
GIT_USER=<username> npm run deploy
```

### Docker

```dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html
```

## 📚 参考资源

- [Docusaurus 官方文档](https://docusaurus.io)
- [MDX 文档](https://mdxjs.com)
- [React 文档](https://react.dev)
