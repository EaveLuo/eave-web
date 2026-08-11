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

  assert.equal(articles.length, 8);
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
