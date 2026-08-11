<h2 align="center">
Eave Luo's website
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

```text
├── blog/                          # Chinese articles, tags.yml, and authors.yml
├── i18n/en/docusaurus-plugin-content-blog/
│   └── ...                            # English articles mirroring blog/ paths
├── docs/superpowers/              # Project design records, not published site content
├── src/                            # Pages, components, themes, and build plugins
├── static/                         # Static assets
├── docusaurus.config.ts            # Site configuration
├── vercel.json                     # Permanent redirects for legacy Docs routes
├── tailwind.config.js              # Tailwind CSS configuration
└── package.json
```

Publish all new articles under `blog/`, with English translations in the matching i18n Blog path. Lists are ordered newest-first by the front matter `date`, and `tags` provide article groups.
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
