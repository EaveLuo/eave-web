const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  collectFullSiteFeedItems,
  writeFullSiteFeedFiles,
} = require('./fullSiteFeed');

function createTempSite() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'eave-feed-'));
}

function writeMarkdown(filePath, source) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, source, 'utf8');
}

const siteConfig = {
  url: 'https://eaveluo.com',
  baseUrl: '/',
  title: 'Eave Luo',
  favicon: 'img/favicon.ico',
};

test('collectFullSiteFeedItems merges blog posts and dated docs sorted newest first', () => {
  const siteDir = createTempSite();

  writeMarkdown(
    path.join(siteDir, 'docs', 'ai', 'agent.md'),
    `---
title: Agent Notes
description: Notes about agents
date: 2026-04-10
tags: [AI, Agent]
---

# Agent Notes

Docs body.
`,
  );
  writeMarkdown(
    path.join(siteDir, 'docs', 'ai', 'intro.md'),
    `---
title: AI Intro
date: 2026-05-01
---

# Intro pages are not articles.
`,
  );
  writeMarkdown(
    path.join(siteDir, 'docs', 'operation', 'hidden.md'),
    `---
title: Hidden
date: 2026-05-02
unlisted: true
---

# Hidden
`,
  );

  const items = collectFullSiteFeedItems({
    blogPosts: [
      {
        metadata: {
          title: 'Website 0.8.0',
          permalink: '/blog/website/0.8.0',
          date: new Date('2026-04-18T00:00:00.000Z'),
          description: 'Release notes',
          frontMatter: {},
          tags: [{ label: 'Website' }],
          authors: [{ name: 'Eave Luo', url: 'https://eaveluo.com' }],
        },
      },
      {
        metadata: {
          title: 'Draft Blog',
          permalink: '/blog/draft',
          date: new Date('2026-05-01T00:00:00.000Z'),
          description: 'Draft',
          frontMatter: { draft: true },
          tags: [],
          authors: [],
        },
      },
    ],
    siteDir,
    locale: 'zh-CN',
    defaultLocale: 'zh-CN',
    siteConfig,
  });

  assert.deepEqual(
    items.map((item) => item.title),
    ['Website 0.8.0', 'Agent Notes'],
  );
  assert.equal(items[0].link, 'https://eaveluo.com/blog/website/0.8.0');
  assert.equal(items[1].link, 'https://eaveluo.com/docs/ai/agent');
  assert.deepEqual(items[1].category, [
    { name: 'AI', term: 'AI' },
    { name: 'Agent', term: 'Agent' },
  ]);
});

test('writeFullSiteFeedFiles writes configured feeds under the blog route path', async () => {
  const siteDir = createTempSite();
  const outDir = path.join(siteDir, 'build');

  await writeFullSiteFeedFiles({
    items: [
      {
        title: 'All Articles Entry',
        id: 'https://eaveluo.com/docs/ai/agent',
        link: 'https://eaveluo.com/docs/ai/agent',
        date: new Date('2026-04-10T00:00:00.000Z'),
        description: 'Notes about agents',
        content: 'Notes about agents',
        category: [{ name: 'AI', term: 'AI' }],
      },
    ],
    outDir,
    routeBasePath: 'blog',
    locale: 'zh-CN',
    siteConfig,
    feedOptions: {
      type: ['rss', 'atom', 'json'],
      title: 'Eave Luo',
      description: 'All articles from Eave Luo',
      copyright: 'Copyright Eave Luo',
    },
  });

  const rss = fs.readFileSync(path.join(outDir, 'blog', 'rss.xml'), 'utf8');
  const atom = fs.readFileSync(path.join(outDir, 'blog', 'atom.xml'), 'utf8');
  const json = fs.readFileSync(path.join(outDir, 'blog', 'feed.json'), 'utf8');

  assert.match(rss, /All Articles Entry/);
  assert.match(atom, /All Articles Entry/);
  assert.match(json, /All Articles Entry/);
});
