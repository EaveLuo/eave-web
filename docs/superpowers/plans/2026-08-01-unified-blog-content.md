# Unified Blog Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the split Docs/Blog experience with one Blog content system whose article, homepage, tag, feed, and legacy URL behavior is consistent in Chinese and English.

**Architecture:** Move the 67 publishable Docs files per locale under the existing Blog content roots and replace the four Docs landing pages with Blog tag pages. Use Docusaurus Blog as the only content engine, a simplified build-time homepage data plugin for the latest 12 posts, and repository-owned Vercel 308 rules for legacy URLs.

**Tech Stack:** Docusaurus 3.10.1, React 19, TypeScript 6, CommonJS build plugins, Node test runner, gray-matter, Vercel static hosting.

## Global Constraints

- The canonical content root is `blog/`; English translations mirror it under `i18n/en/docusaurus-plugin-content-blog/`.
- Each locale contains exactly 76 publishable Blog articles after migration: 67 former Docs articles plus 9 existing Blog posts.
- Article lists, homepage cards, and tag result pages use `date` descending, newest first; migration preserves every existing publication date.
- The four former domain intro pages become tag pages and do not enter the Blog timeline.
- Existing titles, body content, keywords, slugs, images, heading anchors, and publication dates remain stable unless normalization is required for Blog front matter.
- Vercel performs permanent server-side redirects; React client redirects are not used.
- No new runtime dependency is introduced.
- Internal links, RSS, sitemap, canonical URLs, navigation, and footer links use `/blog/**`, never `/docs/**`.

---

### Task 1: Add a failing repository-level content contract

**Files:**
- Create: `scripts/unified-content.test.js`

**Interfaces:**
- Consumes: repository paths and `gray-matter`.
- Produces: executable assertions for `listMarkdown(root)`, `loadPost(file)`, and the 76-post bilingual content contract used throughout the migration.

- [ ] **Step 1: Write the failing content inventory test**

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const zhRoot = path.join(root, 'blog');
const enRoot = path.join(root, 'i18n', 'en', 'docusaurus-plugin-content-blog');

function listMarkdown(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdown(fullPath);
    return /\.mdx?$/.test(entry.name) ? [fullPath] : [];
  });
}

function relativePosts(dir) {
  return listMarkdown(dir)
    .map((file) => path.relative(dir, file).replace(/\\/g, '/'))
    .sort();
}

test('all publishable content lives in the bilingual Blog roots', () => {
  const zh = relativePosts(zhRoot);
  const en = relativePosts(enRoot);
  assert.equal(zh.length, 76);
  assert.deepEqual(en, zh);

  for (const file of [...listMarkdown(zhRoot), ...listMarkdown(enRoot)]) {
    const {data} = matter(fs.readFileSync(file, 'utf8'));
    assert.equal(typeof data.title, 'string', `${file} needs title`);
    assert.ok(data.description, `${file} needs description`);
    assert.ok(data.date, `${file} needs date`);
    assert.deepEqual(data.authors, ['eave'], `${file} needs the stable author id`);
    assert.ok(Array.isArray(data.tags) && data.tags.length > 0, `${file} needs tags`);
    for (const field of ['sidebar_position', 'sidebar_label', 'icon', 'color', 'categories', 'author']) {
      assert.equal(data[field], undefined, `${file} still has ${field}`);
    }
  }
});
```

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run: `node --test --test-name-pattern="all publishable content" scripts/unified-content.test.js`

Expected: FAIL because each Blog root contains only 9 posts and the former Docs still live outside Blog.

- [ ] **Step 3: Keep the red test in place for Task 2**

```powershell
git status --short -- scripts/unified-content.test.js
```

Expected: `?? scripts/unified-content.test.js`.

---

### Task 2: Migrate and normalize the bilingual content trees

**Files:**
- Create temporarily, then delete: `scripts/migrate-docs-to-blog.js`
- Create: `blog/authors.yml`
- Create: `blog/tags.yml`
- Create: `i18n/en/docusaurus-plugin-content-blog/tags.yml`
- Modify mechanically: `blog/**/*.md`
- Modify mechanically: `i18n/en/docusaurus-plugin-content-blog/**/*.md`
- Delete after migration: `docs/ai/`, `docs/back-end/`, `docs/front-end/`, `docs/operation/`
- Delete after migration: `i18n/en/docusaurus-plugin-content-docs/`
- Delete after author-map move: `i18n/zh-CN/docusaurus-plugin-content-blog/authors.yml`
- Test: `scripts/unified-content.test.js`

**Interfaces:**
- Consumes: the old Docs trees, existing Blog trees, `gray-matter`, and stable tag IDs.
- Produces: 76 matched post paths per locale with normalized front matter; `authors.yml` and localized `tags.yml` resolve every author/tag reference.

- [ ] **Step 1: Add the one-time migration utility**

```js
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const landings = new Set(['ai/intro.md', 'back-end/intro.md', 'front-end/intro.md', 'operation/intro.md']);
const aliases = new Map([
  ['前端', 'frontend'], ['Frontend', 'frontend'], ['Front-end Engineering', 'frontend'], ['front-end engineering', 'frontend'],
  ['后端', 'backend'], ['Backend', 'backend'], ['backend', 'backend'],
  ['运维', 'operations'], ['DevOps', 'operations'],
  ['AI', 'ai'], ['ai', 'ai'],
  ['Go', 'go'], ['Node.js', 'node-js'], ['Webpack', 'webpack-5'],
  ['OpenClaw', 'openclaw'], ['openclaw', 'openclaw'], ['AI Agent', 'agents'],
  ['Memory', 'memory'], ['Dreaming', 'dreaming'], ['记忆巩固', 'memory-consolidation'], ['Memory Consolidation', 'memory-consolidation'],
  ['ChatGPT', 'chatgpt'], ['OpenAI', 'openai'], ['QMD', 'qmd'], ['RAG', 'rag'], ['本地搜索', 'local-search'], ['Local Search', 'local-search'],
  ['acp', 'acp'], ['agent-protocol', 'agent-protocol'], ['claude-code', 'claude-code'], ['codex', 'codex'], ['multi-agent', 'multi-agent'], ['architecture', 'architecture'],
  ['站点建设', 'website'], ['站点建设计划', 'website'], ['site construction', 'website'], ['site construction plan', 'website'], ['Website Build', 'website'], ['博客', 'website'], ['Blog', 'website'],
  ['Docusaurus', 'docusaurus'], ['性能优化', 'performance'], ['Performance', 'performance'], ['Performance Optimization', 'performance'], ['performance optimization', 'performance'],
  ['交互优化', 'ux'], ['UX', 'ux'], ['国际化', 'i18n'], ['Internationalization', 'i18n'], ['i18n', 'i18n'],
  ['文档规范', 'documentation'], ['Documentation', 'documentation'], ['版本发布', 'release'], ['Release', 'release'], ['日常', 'daily'], ['Daily Life', 'daily'],
]);

function extractDescription(body) {
  return body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '').replace(/[*_`>#-]/g, ' ').replace(/\s+/g, ' ')
    .trim().slice(0, 150);
}

function titleFrom(data, body, relativePath) {
  return data.title || data.sidebar_label || body.match(/^#\s+(.+)$/m)?.[1]?.trim()
    || path.basename(relativePath, path.extname(relativePath));
}

function pathTags(relativePath) {
  if (relativePath.startsWith('front-end/webpack5/')) return ['frontend', 'webpack-5'];
  if (relativePath.startsWith('back-end/go/')) return ['backend', 'go'];
  if (relativePath.startsWith('back-end/node/')) return ['backend', 'node-js'];
  if (relativePath.startsWith('back-end/')) return ['backend'];
  if (relativePath.startsWith('operation/linux/')) return ['operations', 'linux'];
  if (relativePath.startsWith('operation/nginx/')) return ['operations', 'nginx'];
  if (relativePath.startsWith('operation/')) return ['operations'];
  if (relativePath.startsWith('ai/openclaw/')) return ['ai', 'openclaw'];
  if (relativePath.startsWith('ai/')) return ['ai'];
  if (relativePath.startsWith('website/')) return ['website'];
  return [];
}

function normalizeTags(relativePath, input) {
  const normalized = input.flatMap((tag) => {
    if (tag === '站点建设，Docusaurus，性能优化') return ['website', 'docusaurus', 'performance'];
    return aliases.has(tag) ? [aliases.get(tag)] : [];
  });
  return [...new Set([...pathTags(relativePath), ...normalized])];
}

function migrateLocale(sourceRoot, targetRoot) {
  for (const topLevel of ['ai', 'back-end', 'front-end', 'operation']) {
    const sourceDir = path.join(sourceRoot, topLevel);
    for (const file of walkMarkdown(sourceDir)) {
      const relativePath = path.relative(sourceRoot, file).replace(/\\/g, '/');
      if (landings.has(relativePath)) continue;
      const parsed = matter(fs.readFileSync(file, 'utf8'));
      const data = {...parsed.data};
      data.title = titleFrom(data, parsed.content, relativePath);
      data.description = data.description || extractDescription(parsed.content);
      data.authors = ['eave'];
      data.tags = normalizeTags(relativePath, data.tags || []);
      for (const key of ['sidebar_position', 'sidebar_label', 'icon', 'color', 'categories', 'author']) delete data[key];
      const destination = path.join(targetRoot, relativePath);
      fs.mkdirSync(path.dirname(destination), {recursive: true});
      fs.writeFileSync(destination, matter.stringify(parsed.content, data), 'utf8');
    }
    fs.rmSync(sourceDir, {recursive: true, force: true});
  }
}

function walkMarkdown(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdown(fullPath);
    return /\.mdx?$/.test(entry.name) ? [fullPath] : [];
  });
}

function normalizeExistingBlog(targetRoot) {
  for (const file of walkMarkdown(targetRoot)) {
    const relativePath = path.relative(targetRoot, file).replace(/\\/g, '/');
    const parsed = matter(fs.readFileSync(file, 'utf8'));
    const data = {...parsed.data};
    data.title = titleFrom(data, parsed.content, relativePath);
    data.description = data.description || extractDescription(parsed.content);
    data.authors = ['eave'];
    data.tags = normalizeTags(relativePath, data.tags || []);
    for (const key of ['sidebar_position', 'sidebar_label', 'icon', 'color', 'categories', 'author']) delete data[key];
    fs.writeFileSync(file, matter.stringify(parsed.content, data), 'utf8');
  }
}

const zhBlog = path.join(root, 'blog');
const enBlog = path.join(root, 'i18n', 'en', 'docusaurus-plugin-content-blog');
migrateLocale(path.join(root, 'docs'), zhBlog);
migrateLocale(path.join(root, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current'), enBlog);
normalizeExistingBlog(zhBlog);
normalizeExistingBlog(enBlog);
fs.rmSync(path.join(root, 'i18n', 'en', 'docusaurus-plugin-content-docs'), {recursive: true, force: true});
```

- [ ] **Step 2: Add stable author and tag dictionary generation to the migration utility**

Append the exact bilingual labels below to `scripts/migrate-docs-to-blog.js`. The generated YAML uses identical keys and permalinks in both locales while localizing labels and descriptions.

```js
const tagLabels = {
  zh: {
    frontend: '前端', backend: '后端', operations: '运维', ai: 'AI',
    go: 'Go', 'node-js': 'Node.js', 'webpack-5': 'Webpack 5', linux: 'Linux', nginx: 'Nginx',
    openclaw: 'OpenClaw', agents: 'AI Agent', memory: '记忆', 'memory-consolidation': '记忆巩固',
    dreaming: 'Dreaming', chatgpt: 'ChatGPT', openai: 'OpenAI', qmd: 'QMD', rag: 'RAG',
    'local-search': '本地搜索', acp: 'ACP', 'agent-protocol': 'Agent Protocol',
    'claude-code': 'Claude Code', codex: 'Codex', 'multi-agent': '多智能体', architecture: '架构',
    website: '站点建设', docusaurus: 'Docusaurus', performance: '性能优化', ux: 'UX',
    i18n: '国际化', documentation: '文档规范', release: '版本发布', daily: '日常',
  },
  en: {
    frontend: 'Frontend', backend: 'Backend', operations: 'Operations', ai: 'AI',
    go: 'Go', 'node-js': 'Node.js', 'webpack-5': 'Webpack 5', linux: 'Linux', nginx: 'Nginx',
    openclaw: 'OpenClaw', agents: 'AI Agents', memory: 'Memory', 'memory-consolidation': 'Memory Consolidation',
    dreaming: 'Dreaming', chatgpt: 'ChatGPT', openai: 'OpenAI', qmd: 'QMD', rag: 'RAG',
    'local-search': 'Local Search', acp: 'ACP', 'agent-protocol': 'Agent Protocol',
    'claude-code': 'Claude Code', codex: 'Codex', 'multi-agent': 'Multi-agent', architecture: 'Architecture',
    website: 'Website', docusaurus: 'Docusaurus', performance: 'Performance', ux: 'UX',
    i18n: 'Internationalization', documentation: 'Documentation', release: 'Release', daily: 'Daily Life',
  },
};

function writeTagsFile(target, labels, locale) {
  const source = Object.entries(labels).map(([id, label]) => [
    `${id}:`,
    `  label: ${JSON.stringify(label)}`,
    `  permalink: /${id}`,
    `  description: ${JSON.stringify(locale === 'zh' ? `${label}相关文章` : `Articles about ${label}`)}`,
  ].join('\n')).join('\n');
  fs.writeFileSync(target, `${source}\n`, 'utf8');
}

const zhAuthorSource = path.join(root, 'i18n', 'zh-CN', 'docusaurus-plugin-content-blog', 'authors.yml');
fs.copyFileSync(zhAuthorSource, path.join(zhBlog, 'authors.yml'));
fs.rmSync(path.dirname(zhAuthorSource), {recursive: true, force: true});
writeTagsFile(path.join(zhBlog, 'tags.yml'), tagLabels.zh, 'zh');
writeTagsFile(path.join(enBlog, 'tags.yml'), tagLabels.en, 'en');
```

- [ ] **Step 3: Run the migration once and remove the one-time utility**

Run: `node scripts/migrate-docs-to-blog.js`

Expected: 67 former Docs files are added to each Blog root; the four old top-level Docs content directories and the English Docs plugin content directory are removed.

Delete `scripts/migrate-docs-to-blog.js` with `apply_patch` after checking the migrated diff.

- [ ] **Step 4: Run the red test again and make metadata corrections until green**

Run: `node --test --test-name-pattern="all publishable content" scripts/unified-content.test.js`

Expected: PASS with 76 matched paths per locale and normalized metadata.

- [ ] **Step 5: Commit the content migration**

```powershell
git add -- blog docs/ai docs/back-end docs/front-end docs/operation i18n scripts/unified-content.test.js
git commit -m "refactor: unify articles under blog content"
```

---

### Task 3: Add permanent Vercel redirects with coverage

**Files:**
- Create: `vercel.json`
- Modify: `scripts/unified-content.test.js`

**Interfaces:**
- Consumes: the final Blog paths and stable tag permalinks from Task 2.
- Produces: ordered Vercel redirect rules and tests proving each legacy content route reaches an existing Blog route or tag route.

- [ ] **Step 1: Add the failing redirect test**

```js
test('Vercel permanently redirects legacy Docs routes before catch-all rules', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.ok(config.redirects.every((rule) => rule.permanent === true));
  assert.deepEqual(config.redirects.slice(-2), [
    {source: '/docs/:path*', destination: '/blog/:path*', permanent: true},
    {source: '/en/docs/:path*', destination: '/en/blog/:path*', permanent: true},
  ]);
  for (const source of ['/docs', '/docs/front-end/intro', '/docs/category/node']) {
    assert.ok(config.redirects.slice(0, -2).some((rule) => rule.source === source));
  }
});
```

- [ ] **Step 2: Run the redirect test and confirm it fails**

Run: `node --test --test-name-pattern="Vercel permanently" scripts/unified-content.test.js`

Expected: FAIL with `ENOENT` for `vercel.json`.

- [ ] **Step 3: Add ordered explicit and catch-all redirects**

Create `vercel.json` with the complete ordered rule set below. Explicit Chinese and English landing/category rules precede the two catch-all article rules.

```json
{
  "redirects": [
    {"source": "/docs", "destination": "/blog", "permanent": true},
    {"source": "/docs/front-end/intro", "destination": "/blog/tags/frontend", "permanent": true},
    {"source": "/docs/back-end/intro", "destination": "/blog/tags/backend", "permanent": true},
    {"source": "/docs/operation/intro", "destination": "/blog/tags/operations", "permanent": true},
    {"source": "/docs/ai/intro", "destination": "/blog/tags/ai", "permanent": true},
    {"source": "/docs/category/ai", "destination": "/blog/tags/ai", "permanent": true},
    {"source": "/docs/category/openclaw", "destination": "/blog/tags/openclaw", "permanent": true},
    {"source": "/docs/category/go", "destination": "/blog/tags/go", "permanent": true},
    {"source": "/docs/category/node", "destination": "/blog/tags/node-js", "permanent": true},
    {"source": "/docs/category/webpack-5", "destination": "/blog/tags/webpack-5", "permanent": true},
    {"source": "/docs/category/linux", "destination": "/blog/tags/linux", "permanent": true},
    {"source": "/docs/category/nginx", "destination": "/blog/tags/nginx", "permanent": true},
    {"source": "/en/docs", "destination": "/en/blog", "permanent": true},
    {"source": "/en/docs/front-end/intro", "destination": "/en/blog/tags/frontend", "permanent": true},
    {"source": "/en/docs/back-end/intro", "destination": "/en/blog/tags/backend", "permanent": true},
    {"source": "/en/docs/operation/intro", "destination": "/en/blog/tags/operations", "permanent": true},
    {"source": "/en/docs/ai/intro", "destination": "/en/blog/tags/ai", "permanent": true},
    {"source": "/en/docs/category/ai", "destination": "/en/blog/tags/ai", "permanent": true},
    {"source": "/en/docs/category/openclaw", "destination": "/en/blog/tags/openclaw", "permanent": true},
    {"source": "/en/docs/category/go", "destination": "/en/blog/tags/go", "permanent": true},
    {"source": "/en/docs/category/node", "destination": "/en/blog/tags/node-js", "permanent": true},
    {"source": "/en/docs/category/webpack-5", "destination": "/en/blog/tags/webpack-5", "permanent": true},
    {"source": "/en/docs/category/linux", "destination": "/en/blog/tags/linux", "permanent": true},
    {"source": "/en/docs/category/nginx", "destination": "/en/blog/tags/nginx", "permanent": true},
    {"source": "/docs/:path*", "destination": "/blog/:path*", "permanent": true},
    {"source": "/en/docs/:path*", "destination": "/en/blog/:path*", "permanent": true}
  ]
}
```

- [ ] **Step 4: Run redirect coverage**

Run: `node --test --test-name-pattern="Vercel permanently" scripts/unified-content.test.js`

Expected: PASS.

- [ ] **Step 5: Commit redirects**

```powershell
git add -- vercel.json scripts/unified-content.test.js
git commit -m "feat: redirect legacy docs routes to blog"
```

---

### Task 4: Make homepage data Blog-only and date-ordered

**Files:**
- Create: `src/plugin/plugin-homepage-data/articles.js`
- Create: `src/plugin/plugin-homepage-data/articles.test.js`
- Modify: `src/plugin/plugin-homepage-data/index.js`
- Modify: `src/components/Homepage/LatestArticles/index.tsx`
- Modify: `src/components/Homepage/LatestArticles/styles.module.css`

**Interfaces:**
- Consumes: `readBlogArticles(siteDir, locale, defaultLocale)` returning Blog articles with tag `{label, permalink}` objects.
- Produces: `getLatestArticles(articles, 12)` sorted by `date` descending and Homepage data `{items, lastUpdated}` with no Docs/Blog type split.

- [ ] **Step 1: Write failing tests for nested slugs, localized tags, and date order**

```js
const assert = require('node:assert/strict');
const test = require('node:test');
const {resolveBlogPermalink, getLatestArticles} = require('./articles');

test('resolveBlogPermalink preserves nested paths and relative custom slugs', () => {
  assert.equal(resolveBlogPermalink('back-end/webAPI.md', {slug: 'web-api'}, 'zh-CN', 'zh-CN'), '/blog/back-end/web-api');
  assert.equal(resolveBlogPermalink('back-end/webAPI.md', {slug: 'web-api'}, 'en', 'zh-CN'), '/en/blog/back-end/web-api');
});

test('getLatestArticles returns newest posts first and applies the limit', () => {
  const result = getLatestArticles([
    {id: 'old', date: '2024-01-01'},
    {id: 'new', date: '2026-01-01'},
  ], 1);
  assert.deepEqual(result.map((post) => post.id), ['new']);
});
```

- [ ] **Step 2: Run the helper tests and confirm the missing-module failure**

Run: `node --test src/plugin/plugin-homepage-data/articles.test.js`

Expected: FAIL because `articles.js` does not exist.

- [ ] **Step 3: Extract Blog-only article helpers**

Implement and export:

```js
function resolveBlogPermalink(relativePath, frontMatter, locale, defaultLocale) {
  const prefix = locale === defaultLocale ? '/blog' : `/${locale}/blog`;
  const fileSlug = relativePath.replace(/\\/g, '/').replace(/(?:\/index)?\.mdx?$/, '');
  if (!frontMatter.slug) return joinUrlPath(prefix, fileSlug);
  const segments = fileSlug.split('/');
  segments[segments.length - 1] = String(frontMatter.slug).replace(/^\/+|\/+$/g, '');
  return joinUrlPath(prefix, segments.join('/'));
}

function getLatestArticles(articles, limit = 12) {
  return [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
```

`readBlogArticles` also loads the locale's `tags.yml`, converts stable IDs to localized `{label, permalink}` objects, excludes drafts/unlisted files, and uses the same description/date normalization already present in the plugin.

- [ ] **Step 4: Simplify the plugin payload and homepage component**

`src/plugin/plugin-homepage-data/index.js` returns only:

```js
return {latestArticles: getLatestArticles(readBlogArticles(siteDir, currentLocale, defaultLocale))};
```

`LatestArticles` removes the `type` field and Blog/Doc badge branch, renders linked tag chips, and replaces the two footer buttons with:

```tsx
<ActionButton to="/blog" icon={<ArrowRight size={16} aria-hidden="true" />}>
  <Translate id="homepage.latestArticles.viewAll">查看全部文章</Translate>
</ActionButton>
```

- [ ] **Step 5: Run helper tests and TypeScript**

Run: `node --test src/plugin/plugin-homepage-data/articles.test.js`

Expected: PASS.

Run: `bun run typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit homepage unification**

```powershell
git add -- src/plugin/plugin-homepage-data src/components/Homepage/LatestArticles
git commit -m "refactor: make homepage articles blog-only"
```

---

### Task 5: Unify Blog navigation, cards, tags, and footer

**Files:**
- Modify: `docusaurus.config.ts`
- Create: `src/components/BlogArticleGrid/index.tsx`
- Create: `src/components/BlogArticleGrid/styles.module.css`
- Modify: `src/theme/BlogListPage/index.tsx`
- Modify: `src/theme/BlogListPage/styles.module.css`
- Create: `src/theme/BlogTagsPostsPage/index.tsx`
- Modify: `src/theme/Footer/links.ts`
- Modify: `src/theme/Footer/links.test.js`
- Modify: `src/theme/Footer/index.tsx`
- Modify: locale message files containing `homepage.latestArticles.*`, `blogListPage.*`, `footer.*`

**Interfaces:**
- Consumes: Docusaurus Blog metadata whose tags contain `label` and `permalink`.
- Produces: one Blog navbar entry, clickable tag links on cards, a tag-index link, and footer sections pointing to Blog tags and locale-aware RSS.

- [ ] **Step 1: Extend the footer test before changing links**

```js
test('getNavLinks exposes Blog tag groups and no Docs routes', () => {
  const sections = getNavLinks('/blog/rss.xml', (id, message) => message);
  const serialized = JSON.stringify(sections);
  assert.doesNotMatch(serialized, /\/docs(?:\/|\")/);
  assert.match(serialized, /\/blog\/tags\/frontend/);
  assert.match(serialized, /\/blog\/tags\/backend/);
  assert.match(serialized, /\/blog\/tags\/ai/);
});
```

- [ ] **Step 2: Run the footer test and confirm the legacy link failure**

Run: `node --test src/theme/Footer/links.test.js`

Expected: FAIL because the knowledge section still links to `/docs/**`.

- [ ] **Step 3: Replace Docs navigation with Blog and tag navigation**

In `docusaurus.config.ts`, remove four `docSidebar` navbar items and keep one `/blog` item. In `getNavLinks`, point the knowledge links to stable Blog tag permalinks and retain Blog, About, and locale-aware RSS in the More section.

```ts
links: [
  {id: 'frontend', label: translateMessage('footer.frontend', '前端开发'), to: '/blog/tags/frontend'},
  {id: 'backend', label: translateMessage('footer.backend', '后端开发'), to: '/blog/tags/backend'},
  {id: 'operation', label: translateMessage('footer.operation', '运维部署'), to: '/blog/tags/operations'},
  {id: 'ai', label: translateMessage('footer.ai', '人工智能'), to: '/blog/tags/ai'},
]
```

- [ ] **Step 4: Extract one article grid and make Blog card tags independently clickable**

Move the Blog card and grid markup into `BlogArticleGrid`, accepting `posts: BlogArticle[]`. Restructure each card so its title/read-more links point to the post while tag chips use `tag.permalink`. Do not place tag links inside a wrapping post link.

```tsx
<Link to={post.permalink} className={styles.titleLink}>
  <h2 className={styles.title}>{post.title}</h2>
</Link>
<div className={styles.tags}>
  {post.tags.slice(0, 3).map((tag) => (
    <Link key={tag.permalink} to={tag.permalink} className={styles.tag}>
      <Tag size={12} />{tag.label}
    </Link>
  ))}
</div>
```

Use the shared grid in both `BlogListPage` and a new `BlogTagsPostsPage` theme override. The tag page retains Docusaurus metadata, description, all-tags link, and paginator, but maps its `items` to `BlogArticle[]` and renders `BlogArticleGrid`, so a selected tag has the same card experience as the main archive. Add a `/blog/tags` action to the main archive and retain Docusaurus pagination order.

- [ ] **Step 5: Update Chinese and English copy**

Replace Docs/Blog split strings with the single concepts “文章/博客” and “Articles/Blog”. Add `homepage.latestArticles.viewAll`, remove uses of `viewAllDocs`, `viewAllBlog`, `badgeDoc`, and `badgeBlog`, and keep translation IDs aligned across locales.

- [ ] **Step 6: Run focused tests and type checking**

Run: `node --test src/theme/Footer/links.test.js`

Expected: PASS.

Run: `bun run typecheck`

Expected: exit 0.

- [ ] **Step 7: Commit the unified navigation experience**

```powershell
git add -- docusaurus.config.ts src/theme/BlogListPage src/theme/Footer i18n
git commit -m "feat: unify article navigation around blog tags"
```

---

### Task 6: Remove the Docs runtime and repair internal references

**Files:**
- Modify: `docusaurus.config.ts`
- Modify: `tailwind.config.js`
- Modify: `README.md`
- Modify: `README.en.md`
- Modify: migrated `blog/**/*.md`
- Modify: migrated `i18n/en/docusaurus-plugin-content-blog/**/*.md`
- Delete: `sidebars.ts`
- Delete: `src/plugin/plugin-content-docs/index.js`
- Delete: `src/plugin/plugin-content-blog/index.js`
- Delete: `src/plugin/plugin-content-blog/fullSiteFeed.js`
- Delete: `src/plugin/plugin-content-blog/fullSiteFeed.test.js`
- Delete: `src/pages/docs/index.tsx`
- Delete: `src/pages/docs/styles.module.css`
- Delete: `src/components/DocCategoryIndex/index.tsx`
- Delete: `src/components/DocCategoryIndex/styles.module.css`
- Delete: `src/components/ArticleDate/index.tsx`
- Delete: `src/components/ArticleDate/format.ts`
- Delete: `src/components/ArticleDate/format.test.js`
- Delete: `src/components/ArticleDate/styles.module.css`
- Delete: `src/theme/DocItem/Content/index.tsx`
- Delete: `src/theme/DocItem/Layout/index.tsx`
- Delete: `src/theme/DocItem/Layout/styles.module.css`
- Test: `scripts/unified-content.test.js`

**Interfaces:**
- Consumes: standard `@docusaurus/plugin-content-blog` and the Blog-only homepage plugin from Task 4.
- Produces: a runtime with no Docs routes, Docs components, Docs global data, custom full-site feed merge, or internal `/docs/**` links.

- [ ] **Step 1: Add a failing legacy-reference test**

```js
test('runtime and internal article links no longer target Docs', () => {
  const roots = ['src', 'blog', path.join('i18n', 'en', 'docusaurus-plugin-content-blog')];
  const offenders = [];
  for (const relativeRoot of roots) {
    for (const file of walkTextFiles(path.join(root, relativeRoot))) {
      const source = fs.readFileSync(file, 'utf8');
      if (/\]\(\/docs(?:\/|\))|to=["']\/docs|to:\s*["']\/docs|docSidebar|plugin-content-docs/.test(source)) {
        offenders.push(path.relative(root, file));
      }
    }
  }
  assert.deepEqual(offenders, []);
});
```

`walkTextFiles` recursively returns `.js`, `.ts`, `.tsx`, `.md`, `.mdx`, `.json`, and `.css` files.

- [ ] **Step 2: Run the legacy-reference test and confirm it fails**

Run: `node --test --test-name-pattern="runtime and internal" scripts/unified-content.test.js`

Expected: FAIL with existing Docs plugin, page, footer, and Markdown references.

- [ ] **Step 3: Switch to the standard Blog plugin and delete Docs-only runtime code**

Use `@docusaurus/plugin-content-blog` directly in `docusaurus.config.ts` with the existing Blog options. Keep preset `docs: false` and `blog: false`, because the Blog plugin remains explicitly configured once. Remove the explicit Docs plugin and custom Docs/homepage category configuration.

Delete the files listed above. The standard Blog plugin now owns feed generation, so the Docs-merging custom Blog wrapper is removed rather than retained as duplicate feed code.

- [ ] **Step 4: Rewrite internal links and documentation**

Map article links from `/docs/<suffix>` to `/blog/<suffix>`. Map former intro/category links directly to the stable tag pages. Do not rewrite external URLs containing `/docs/` or literal filesystem examples such as `/docs/back-end/node/path.md` inside code blocks.

Update both READMEs to describe one `blog/` content tree and tag-based browsing. Update Tailwind scanning from separate Docs/Blog globs to `./blog/**/*.{md,mdx}` plus the localized Blog path.

- [ ] **Step 5: Run legacy-reference coverage and all unit tests**

Run: `node --test --test-name-pattern="runtime and internal" scripts/unified-content.test.js`

Expected: PASS.

Run: `node --test`

Expected: all discovered tests pass with zero failures.

- [ ] **Step 6: Commit runtime cleanup**

```powershell
git add -A -- docusaurus.config.ts tailwind.config.js README.md README.en.md sidebars.ts src blog i18n scripts
git commit -m "refactor: remove docs content runtime"
```

---

### Task 7: Verify builds, generated routes, ordering, and redirects

**Files:**
- Modify only if verification exposes a defect: files owned by Tasks 2–6.
- Test: all repository tests and both Docusaurus locale builds.

**Interfaces:**
- Consumes: the complete unified implementation.
- Produces: fresh evidence that the content counts, ordering, route generation, feed, tag pages, type system, and production build meet the design.

- [ ] **Step 1: Run the full automated test suite**

Run: `node --test`

Expected: zero failures.

- [ ] **Step 2: Run TypeScript validation**

Run: `bun run typecheck`

Expected: exit 0 with no TypeScript errors.

- [ ] **Step 3: Build both locales**

Run: `bun run build`

Expected: exit 0; Docusaurus builds `zh-CN` and `en` without broken links.

- [ ] **Step 4: Inspect generated artifacts**

```powershell
Test-Path 'build\blog\index.html'
Test-Path 'build\blog\tags\frontend\index.html'
Test-Path 'build\en\blog\index.html'
Test-Path 'build\en\blog\tags\frontend\index.html'
Test-Path 'build\blog\rss.xml'
```

Expected: every command prints `True`.

Check the homepage data artifact or rendered homepage HTML and confirm the first article date is not older than the following entries. Confirm migrated old posts retain their original dates.

- [ ] **Step 5: Validate Vercel configuration and route targets**

Run: `node --test scripts/unified-content.test.js`

Expected: inventory, metadata, redirect ordering, and legacy-reference tests all pass.

- [ ] **Step 6: Review the final diff and commit verification fixes**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors and only intentional files are changed. If verification required a correction, commit it with:

```powershell
git add -A
git commit -m "fix: complete unified blog verification"
```
