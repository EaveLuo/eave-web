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

```bash
├── blog                           # 博客
│   ├── first-blog.md
├── docs                           # 文档/笔记
│   └── doc.md
├── i18n                           # 国际化
├── src
│   ├── components                 # 组件
│   ├── css                        # 自定义CSS
│   ├── pages                      # 自定义页面
│   └── theme                      # 自定义主题组件
├── static                         # 静态资源文件
│   └── img                        # 静态图片
├── docusaurus.config.ts           # 站点的配置信息
├── sidebars.ts                    # 文档的侧边栏
├── package.json
├── tsconfig.json                  # TypeScript配置
├── tailwind.config.js             # TailwindCSS配置
├── postcss.config.js              # PostCSS配置
└── renovate.json                  # Renovate 配置
```

## 📥 运行

```bash
git clone https://github.com/EaveLuo/eave-web.git
cd eave-web

yarn
yarn start
```

构建

```bash
yarn build
```

## 📝 许可证

[MIT](./LICENSE)
