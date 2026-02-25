---
sidebar_position: 0
title: 前端开发指南
description: eave-web 前端开发完整指南
---

# 前端开发指南

欢迎来到 eave-web 的前端开发指南。本文档将帮助你快速上手项目开发。

## 🚀 技术栈

- **框架**: React 19 + TypeScript
- **静态站点**: Docusaurus 3.9
- **样式**: TailwindCSS 4 + Framer Motion
- **构建工具**: Vite (通过 Docusaurus)
- **包管理器**: Yarn

## 📚 文档导航

- **[React 最佳实践](./react/best-practices)** - React 开发规范和技巧
- **[React Hooks 指南](./react/hooks-guide)** - Hooks 完全使用手册
- **[Docusaurus 入门](./docusaurus/intro)** - Docusaurus 基础配置
- **[自定义组件](./docusaurus/custom-components)** - 组件开发指南
- **[TypeScript 规范](./typescript/style-guide)** - 类型定义和编码规范
- **[项目结构](./project-structure)** - 目录组织和文件规范

## 🛠️ 开发环境

### 前置要求

- Node.js >= 18.0
- Yarn >= 1.22

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
# 中文
yarn start

# 英文
yarn start:en
```

### 构建生产版本

```bash
yarn build
```

### 类型检查

```bash
yarn typecheck
```

## 📁 项目结构

```
eave-web/
├── src/
│   ├── components/     # 自定义组件
│   ├── css/            # 全局样式
│   ├── pages/          # 自定义页面
│   └── theme/          # 主题覆盖
├── docs/               # 技术文档
├── blog/               # 博客文章
└── static/             # 静态资源
```

详细结构请参考 [项目结构文档](./project-structure)。

## 🎯 快速开始

### 创建新页面

1. 在 `src/pages/` 创建新文件
2. 使用 `@theme/Layout` 包装
3. 添加元数据

```tsx
import Layout from '@theme/Layout';

export default function NewPage() {
  return (
    <Layout title="页面标题" description="页面描述">
      <main>
        <h1>欢迎来到新页面</h1>
      </main>
    </Layout>
  );
}
```

### 创建新组件

1. 在 `src/components/` 创建组件文件夹
2. 实现组件逻辑
3. 在需要的地方导入使用

```tsx
// src/components/MyComponent/index.tsx
export default function MyComponent({ title }) {
  return <h2>{title}</h2>;
}
```

### 编写文档

1. 在 `docs/` 对应分类下创建 `.md` 文件
2. 添加 Front Matter
3. 在 `sidebars.ts` 配置导航（如需要）

```md
---
sidebar_position: 1
title: 文档标题
---

# 文档内容
```

## 🔧 可用组件

项目已集成以下实用组件：

### SEO 组件

```tsx
import { JsonLd, createArticleSchema } from '@site/src/components/SEO';

<JsonLd
  type="article"
  data={createArticleSchema({
    headline: '文章标题',
    description: '文章描述',
    author: { /* ... */ },
    datePublished: '2026-02-26',
  })}
/>
```

### 懒加载图片

```tsx
import LazyImage from '@site/src/components/LazyImage';

<LazyImage
  src="/img/photo.jpg"
  alt="描述"
  width={800}
  height={600}
/>
```

### MagicUI 组件

- `Particles` - 粒子背景动画
- `IconCloud` - 图标云
- `ShimmerButton` - 闪烁按钮
- `TypingAnimation` - 打字动画

## 📝 代码规范

### 命名规范

- 组件：`PascalCase` (e.g., `UserProfile`)
- 文件：与组件名一致
- Hooks: `use` 前缀 (e.g., `useUserData`)
- 工具函数：`camelCase` (e.g., `formatDate`)

### 导入顺序

1. React
2. Docusaurus
3. 第三方库
4. 内部组件
5. 样式

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 🚢 部署流程

1. 提交代码到 GitHub
2. GitHub Actions 自动运行 CI
3. 通过后自动部署到 Vercel
4. 访问 https://eaveluo.com

## 🤝 贡献指南

### 小改动

1. 直接在 master 分支修改
2. Commit 并 Push
3. 自动部署

### 大改动

1. 创建 feature 分支
2. 开发完成后提交 PR
3. 等待 Review
4. 合并后部署

## 📚 参考资源

- [React 官方文档](https://react.dev)
- [Docusaurus 官方文档](https://docusaurus.io)
- [TailwindCSS 文档](https://tailwindcss.com)
- [TypeScript 文档](https://www.typescriptlang.org)

## ❓ 常见问题

### 如何添加新依赖？

```bash
yarn add package-name
```

### 如何自定义主题？

在 `src/theme/` 下创建对应组件文件覆盖默认主题。

### 如何添加新语言？

1. 在 `i18n/` 添加语言文件夹
2. 在 `docusaurus.config.ts` 配置 locales
3. 翻译内容

---

有问题？查看其他文档或联系项目维护者。
