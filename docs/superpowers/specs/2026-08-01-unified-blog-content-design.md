# 文章与博客统一为 Blog 的设计

## 背景与目标

站点当前同时使用 Docusaurus Docs 与 Blog 两套内容系统。默认语言和英文各有 71 个 Docs 内容文件与 9 篇 Blog；Docs 中有 4 个分类入口页，实际可迁移文章为 67 篇。因此，迁移后每种语言应有 76 篇 Blog 文章，四个原分类入口由标签页替代。

本次改造的目标是：

- 对读者只保留一个“博客”入口和一套文章浏览体验。
- 对作者只保留一个 Blog 内容根目录；默认语言维护在 `blog/`，英文翻译按 Docusaurus 约定维护在 `i18n/en/docusaurus-plugin-content-blog/`。
- 使用标签而不是 Docs 侧栏划分前端、后端、运维、AI、Go、Node.js、Webpack 5、OpenClaw 等内容组。
- 保留旧链接的 SEO 权重与可访问性，旧 `/docs/**` 地址由 Vercel 在边缘层永久重定向到新地址。
- 保留文章日期、描述、关键词、作者、评论、文章内目录、结构化数据、RSS 与多语言能力。

## 方案比较与决定

### 方案 A：完整迁移到 Blog（采用）

把 Docs 中的实际文章移动到 Blog 内容树，移除 Docs 路由、侧栏、分类页和自定义 Docs 数据插件。站点的列表、详情、标签、RSS 和首页数据全部只读取 Blog。

优点是内容模型、维护入口和用户入口真正统一，Blog 原生具备时间线、标签、作者、RSS 和 BlogPosting 结构化数据，最符合传播、分享与 SEO 目标。代价是一次性迁移内容并维护旧 URL 重定向。

### 方案 B：只统一界面，后台继续保留 Docs 与 Blog（不采用）

建立一个聚合列表，把两套内容展示成同一种卡片，但仍从 `docs/` 和 `blog/` 分别加载。

短期移动文件较少，但作者仍需维护两种 front matter、两套插件与两种文章详情页；路由、RSS 和 SEO 语义仍然分裂，不能解决根本问题。

### 方案 C：全部迁移到 Docs（不采用）

保留层级目录和侧栏，再为 Docs 自行补充归档、作者、标签入口、RSS 与分享语义。

它适合版本化产品文档或连续教程，但需要重新实现 Blog 已经提供的能力，也不符合本站以独立文章传播为主的方向。

## 内容结构

默认语言的全部文章放在一个 `blog/` 根目录中，并保留子目录帮助维护：

```text
blog/
├── ai/
│   └── openclaw/
├── back-end/
│   ├── go/
│   └── node/
├── front-end/
│   └── webpack5/
├── operation/
│   ├── linux/
│   └── nginx/
└── website/
```

目录只服务于仓库维护和默认 URL 生成，不再生成 Docs 式侧栏。英文内容保持相同相对路径，放在 `i18n/en/docusaurus-plugin-content-blog/`。

原 `front-end/intro.md`、`back-end/intro.md`、`operation/intro.md` 和 `ai/intro.md` 是分类入口而不是独立文章，不进入 Blog 时间线；其功能由对应标签页替代。其余 67 篇 Docs 与原 9 篇 Blog 全部保留。

## 文章元数据规范

迁移后的每篇文章必须包含：

- `title`：文章标题。
- `date`：保留原发布日期，不因迁移改变排序和搜索语义。
- `authors`：统一使用 Blog 的作者标识；缺失作者的旧 Docs 补为 `eave`。
- `tags`：至少包含一个主题或系列标签。
- `description`：优先保留现有值；没有时在迁移阶段从正文生成简短摘要并写入 front matter。
- `keywords`：原来存在时保留。
- `slug`：原来存在时保留，以保证新 Blog URL 与旧 Docs URL 的路径后缀一致。

删除 Docs 专用的 `sidebar_position`、`icon` 与 `color`。正文、标题锚点、图片和代码块不做无关改写。

标签分为两层，但仍使用 Docusaurus 的同一种 `tags` 字段：

- 领域标签：前端、后端、运维、AI、站点建设。
- 系列或主题标签：Webpack 5、Node.js、Go、Linux、Nginx、OpenClaw，以及现有的具体主题标签。

中英文标签使用共同的稳定标识和 permalink，分别显示中文或英文 label。标签定义文件负责 label、permalink 与描述，避免大小写、标点和同义词造成重复标签。现有异常标签 `站点建设，Docusaurus，性能优化` 拆分为三个独立标签。

默认语言的 `authors.yml` 与 `tags.yml` 放在 `blog/` 根目录；英文对应文件放在 `i18n/en/docusaurus-plugin-content-blog/`。文章只引用稳定的作者和标签标识，不在每篇文章内重复维护展示名称与链接。

## URL 与永久重定向

新 URL 约定如下：

- 文章列表：`/blog` 与 `/en/blog`。
- 文章：`/blog/<原 docs 路径后缀>` 与 `/en/blog/<原 docs 路径后缀>`。
- 标签总览：`/blog/tags` 与 `/en/blog/tags`。
- 标签文章列表：`/blog/tags/<稳定标签 slug>` 与英文对应路径。

仓库根目录新增 `vercel.json`。它随 Git 部署，由 Vercel 在应用加载前返回永久重定向，不使用 React 客户端跳转。普通文章使用两条通配规则：

```text
/docs/:path*    -> /blog/:path*
/en/docs/:path* -> /en/blog/:path*
```

`permanent: true` 使 Vercel 返回 308 永久重定向。以下旧入口必须在通配规则之前配置显式重定向：

- `/docs` 和 `/en/docs` 到对应 Blog 首页。
- 四个旧领域 `intro` 页面到对应标签页。
- 七个 Docs 自动生成分类页（AI、OpenClaw、Go、Node.js、Webpack 5、Linux、Nginx）到对应标签页。

站内 Markdown、导航和页脚中的旧 `/docs/**` 链接直接更新为新 `/blog/**` 或标签地址，避免正常访问也经过重定向。查询参数应由 Vercel 继续传递；带标题锚点的旧文章地址需要在部署预览中验证仍能落到同名锚点。

## 页面与导航体验

首页布局保持不变，但最新内容只显示 Blog 数据：

- 移除 Blog/Doc 类型徽标差异，统一显示为文章。
- 底部两个入口合并为一个“查看全部文章”按钮，指向 `/blog`。
- 卡片标签可点击并进入相应标签页。

站点导航移除 Front end、Back end、Operation、AI 四个 Docs 侧栏入口，仅保留一个“博客”内容入口。页脚的知识分类链接改为主要标签页，RSS 继续指向 Blog feed。

Blog 列表页作为统一文章首页：

- 保留按发布日期倒序的卡片和分页。
- 提供标签总览入口。
- 卡片上的标签可点击，不与整卡链接形成嵌套交互。
- 标签页复用相同的文章卡片视觉和分页体验。

文章详情页使用 Blog 的作者、日期、阅读时长、标签、文章内目录、上一篇/下一篇和评论。Docs 专用面包屑、左侧侧栏、版本组件及详情页覆盖全部移除。

## 插件与数据流

Docusaurus 只启用 Blog 内容插件。现有自定义 Blog 包装层用于合并 Docs 到 RSS 和注入未被消费的全局数据；统一后这些职责不再存在，因此改回标准 `@docusaurus/plugin-content-blog`，由其生成文章路由、标签页、结构化数据、分页和 RSS。

首页数据插件保留，但简化为只扫描当前语言的 Blog 内容，按日期排序后返回最新 12 篇文章。不再读取 Docs、不再生成 `docCategories`，也不再输出 `latestDocs`、`latestBlogs` 或内容类型字段。

删除以下 Docs 专用结构：

- Docs 内容插件配置与 `sidebars.ts`。
- `src/plugin/plugin-content-docs/`。
- `src/pages/docs/`。
- `src/components/DocCategoryIndex/`。
- `src/theme/DocItem/`。
- 自定义全站 feed 中读取 Docs 的逻辑及其旧测试。

README、Tailwind 内容扫描路径、导航、页脚和国际化文案同步更新为单一 Blog 模型。

## SEO 与索引策略

- Blog 插件为文章输出 canonical、BlogPosting 结构化数据和 RSS。
- Sitemap 保留文章页与标签页，继续排除分页重复页。
- 旧 Docs URL 只返回一次永久重定向，不形成重定向链。
- 四个旧领域入口和七个旧分类页定向到语义最接近的标签页，不落到 404 或无关文章。
- 迁移保留标题、发布日期、描述、关键词与正文，避免搜索摘要和排序发生不必要变化。
- 新页面不输出旧 `/docs/**` canonical；站内链接、RSS 与 sitemap 全部使用 `/blog/**`。

## 验证与验收

迁移必须由自动化检查和完整构建共同验证：

1. 内容清单检查：每种语言恰有 76 篇 Blog 文章；除四个分类入口外，旧 Docs 与原 Blog 均能在新内容树找到对应项。
2. 元数据检查：每篇文章都有合法的 `title`、`date`、`authors`、非空 `tags`；不再出现 Docs 专用 front matter。
3. 语言一致性检查：中英文相对路径与稳定标签 slug 对齐。
4. 路由映射测试：所有旧文章 URL 都能由显式规则或通配规则唯一映射到一个实际存在的新 URL；特殊入口优先于通配规则。
5. 站内链接检查：仓库中的内部内容链接不再指向 `/docs/**`，代码示例和外部网站 URL 不被误改。
6. 首页与标签交互测试：首页只有一个总入口，文章卡片和标签链接分别可访问且不存在嵌套链接。
7. 完整验证：运行单元测试、TypeScript 类型检查和 Docusaurus 中英文生产构建。
8. 部署预览抽查：验证普通文章、带自定义 slug 的文章、四个 intro、七个分类页、中英文地址、查询参数及标题锚点的永久重定向。

## 不在本次范围

- 不重写文章正文或重新规划发布日期。
- 不引入全文站内筛选器、搜索后端或新的 CMS。
- 不为系列文章新增独立于标签系统的数据库或内容类型。
- 不改变评论提供商、域名或部署平台。
