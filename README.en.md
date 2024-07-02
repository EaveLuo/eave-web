<h2 align="center">
Eave Luo的博客
</h2>

<p align="center">
<a href="README.md">
简体中文
</a>
</p>

<p align="center">
<a href="https://vercel.com/new/clone?repository-url=https://github.com/EaveLuo/eave-web/tree/master&project-name=blog&repo-name=blog" rel="nofollow"><img src="https://vercel.com/button"></a>
</p>

## 👋 Introduction

Here I will share the problems and solutions encountered by various technology stacks, take you to understand the latest technology stacks and how to apply them in actual development, and hope that my development experience will inspire you.

If you want to build a similar site, you can directly [Fork](https://github.com/EaveLuo/eave-web/fork) this repository, or use [Vercel](https://vercel.com/new/clone?repository-url=https://github.com/EaveLuo/eave-web/tree/master&project-name=blog&repo-name=blog) to deploy it with one click.

## ✨ Features

- 🦖 **Docusaurus** - Based on Docusaurus, provides powerful document generation and blogging functions
- ✍️ **Markdown** - Easy to write, Markdown
- 🎨 **Beautiful** - Neat, beautiful, reading experience first
- 🖥️ **PWA** - Supports PWA, installable, available offline
- 🌐 **i18n** - Supports internationalization
- 💯 **SEO** - Search engine optimization, easy to include
- 📊 **Google Analytics** - Supports Google Analytics
- 🔎 **Full-text search** - Supports [Algolia DocSearch](https://github.com/algolia/docsearch)
- 🚀 **Continuous Integration** - Supports CI/CD, automatically deploys updated content
- 🏞️ **Homepage view** - Displays the latest blog posts, project displays, personal characteristics, technology stack, etc.
- 🗃️ **Blog view** - different blog views, list, grid
- 🌈 **Resource navigation** - collect and share useful and interesting resources
- 📦 **Project display** - display your projects, which can be used as portfolio

## :wrench: technology stack

- Docusaurus
- TailwindCSS
- Framer motion

## 📊 Directory structure

```bash
├── blog # blog
│ ├── first-blog.md
├── docs # documents/notes
│ └── doc.md
├── i18n # internationalization
├── src
│ ├── components # components
│ ├── css # custom CSS
│ ├── pages # custom pages
│ └── theme # custom theme components
├── static # static resource files
│ └── img # Static images
├── docusaurus.config.ts # Site configuration information
├── sidebars.ts # Document sidebar
├── package.json
├── tsconfig.json # TypeScript configuration
├── tailwind.config.js # TailwindCSS configuration
├── postcss.config.js # PostCSS configuration
└── renovate.json # Renovate configuration
```

## 📥 Run

```bash
git clone https://github.com/EaveLuo/eave-web.git
cd eave-web

yarn
yarn start
```

Build

```bash
yarn build
```

## 📝 License

[MIT](./LICENSE)
