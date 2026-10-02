const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const {
  getLatestArticles,
  readBlogArticles,
  resolveBlogPermalink,
} = require('./articles');

test('resolveBlogPermalink respects front matter slugs and locales', () => {
  assert.equal(
    resolveBlogPermalink(
      'back-end/webAPI.md',
      { slug: 'web-api' },
      'zh-CN',
      'zh-CN',
    ),
    '/blog/back-end/web-api',
  );
  assert.equal(
    resolveBlogPermalink(
      'back-end/webAPI.md',
      { slug: 'web-api' },
      'en',
      'zh-CN',
    ),
    '/en/blog/back-end/web-api',
  );
});

test('getLatestArticles returns the newest articles first and applies the limit', () => {
  const articles = [
    { id: 'old', date: '2024-01-01T00:00:00.000Z' },
    { id: 'new', date: '2026-01-01T00:00:00.000Z' },
    { id: 'middle', date: '2025-01-01T00:00:00.000Z' },
  ];

  assert.deepEqual(
    getLatestArticles(articles, 2).map((article) => article.id),
    ['new', 'middle'],
  );
});

test('readBlogArticles loads the unified Blog tree and resolved tag links', () => {
  const siteDir = path.resolve(__dirname, '..', '..', '..');
  const articles = readBlogArticles(siteDir, 'zh-CN', 'zh-CN');

  assert.equal(articles.length, 9);
  assert.ok(
    articles.every((article) =>
      article.tags.every(
        (tag) =>
          typeof tag.label === 'string' &&
          tag.permalink.startsWith('/blog/tags/'),
      ),
    ),
  );
  assert.deepEqual(
    articles.map((article) => article.date),
    [...articles]
      .map((article) => article.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
  );
});

test('the Jev and Laya article is the latest entry in both locales', () => {
  const siteDir = path.resolve(__dirname, '..', '..', '..');

  for (const locale of ['zh-CN', 'en']) {
    const [latest] = readBlogArticles(siteDir, locale, 'zh-CN');
    assert.equal(latest.id, 'ai/jev-laya-system-one');
    assert.equal(latest.date, '2026-10-02T00:00:00.000Z');
    assert.equal(
      latest.path,
      `${locale === 'en' ? '/en' : ''}/blog/ai/jev-laya-system-one`,
    );
    assert.deepEqual(
      latest.tags.map((tag) => tag.id),
      ['ai', 'agents', 'jev', 'laya', 'architecture', 'performance'],
    );
    for (const id of ['jev', 'laya']) {
      const tag = latest.tags.find((entry) => entry.id === id);
      assert.equal(tag.label, id === 'jev' ? 'Jev' : 'Laya');
      assert.equal(
        tag.permalink,
        `${locale === 'en' ? '/en' : ''}/blog/tags/${id}`,
      );
    }
  }
});
