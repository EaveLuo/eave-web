<h2 align="center">
Eave Luo的站点
</h2>

<p align="center">
<a href="README.en.md">
English
</a>
</p>

<p align="center">
<a href="https://vercel.com/new/clone?repository-url=https://github.com/EaveLuo/eave-web/tree/master&project-name=blog&repo-name=blog" rel="nofollow"><img src="https://vercel.com/button"></a>
</p>

## 👋 介绍

在这里我会分享各类技术栈所遇到问题与解决方案，带你了解最新的技术栈以及实际开发中如何应用，并希望我的开发经历对你有所启发。

如果你想要搭建一个类似的站点，可直接 [Fork](https://github.com/EaveLuo/eave-web/fork) 本仓库使用，或者通过 [Vercel](https://vercel.com/new/clone?repository-url=https://github.com/EaveLuo/eave-web/tree/master&project-name=blog&repo-name=blog) 一键部署。

## ✨ 特性

- 🦖 **Docusaurus** - 基于 Docusaurus，提供强大的文档生成和博客功能
- ✍️ **Markdown** - 写作方便，Markdown
- 🎨 **Beautiful** - 整洁，美观，阅读体验优先
- 🖥️ **PWA** - 支持 PWA，可安装，离线可用
- 🌐 **i18n** - 支持国际化
- 💯 **SEO** - 搜索引擎优化，易于收录
- 📊 **谷歌分析** - 支持 Google Analytics
- 🔎 **全文搜索** - 支持 [Algolia DocSearch](https://github.com/algolia/docsearch)
- 🚀 **持续集成** - 支持 CI/CD，自动部署更新内容
- 🏞️ **首页视图** - 显示最新博客文章、项目展示，个人特点，技术栈等
- 🗃️ **博文视图** - 不同的博文视图，列表、宫格
- 🌈 **资源导航** - 收集并分享有用、有意思的资源
- 📦 **项目展示** - 展示你的项目，可用作于作品集

## :wrench: 技术栈

- Docusaurus
- TailwindCSS
- Framer motion

## 📊 目录结构

```text
├── blog/                          # 中文文章、tags.yml 和 authors.yml
├── i18n/en/docusaurus-plugin-content-blog/
│   └── ...                            # 英文文章，与 blog/ 保持相同相对路径
├── docs/superpowers/              # 项目设计与实施记录，不作为站点内容发布
├── src/                            # 页面、组件、主题与构建插件
├── static/                         # 静态资源
├── docusaurus.config.ts            # 站点配置
├── vercel.json                     # 旧 Docs 路由的永久重定向
├── tailwind.config.js              # Tailwind CSS 配置
└── package.json
```

新文章统一发布到 `blog/`；英文翻译在对应的 i18n Blog 目录维护。列表按 front matter 中的 `date` 倒序展示，分组使用 `tags`。
## 📥 运行

需要 Node.js **22.12.0 或更新版本**；CI 使用 Node.js 24，并验证 npm 和 Bun 1.4.2 两种安装方式。Mermaid 12 图表需要支持 ES2024 的现代浏览器，Safari / iOS Safari 至少为 17.4。

```bash
git clone https://github.com/EaveLuo/eave-web.git
cd eave-web

npm ci
npm start
```

也可以使用 Bun（切换包管理器时，先移除旧的 `node_modules`，再从对应锁文件安装）：

```bash
bun install --frozen-lockfile
bun run start
```

提交前验证（使用 Bun 时，将 `npm run` 换成 `bun run`）：

```bash
npm run typecheck
npm run test
npm run build
```

依赖更新需同时维护 `package-lock.json` 和 `bun.lock`，并通过两种安装方式的检查。测试使用 Node 内置的 TypeScript 类型剥离；Node 22.12 上的实验性提示属于预期行为。

## 📝 许可证

[MIT](./LICENSE)
