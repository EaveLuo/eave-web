const assert = require('node:assert/strict');
const test = require('node:test');

const { sortArticlesNewestFirst } = require('./sort');

test('sortArticlesNewestFirst orders archive and tag results by publish date', () => {
  const articles = [
    { id: 'old', date: '2024-01-01T00:00:00.000Z' },
    { id: 'new', date: '2026-01-01T00:00:00.000Z' },
    { id: 'middle', date: '2025-01-01T00:00:00.000Z' },
  ];

  assert.deepEqual(
    sortArticlesNewestFirst(articles).map((article) => article.id),
    ['new', 'middle', 'old'],
  );
  assert.deepEqual(
    articles.map((article) => article.id),
    ['old', 'new', 'middle'],
  );
});
