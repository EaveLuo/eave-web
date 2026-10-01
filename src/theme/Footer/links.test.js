const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
// The test command enables Node's type stripping; TypeScript 7 has no compiler API.
const { getNavLinks } = require('./links.ts');

test('getNavLinks uses the locale-aware RSS href provided by the footer', () => {
  const rssHref = '/en/blog/rss.xml';
  const sections = getNavLinks(rssHref, (id, message) => message);
  const moreSection = sections.find((section) => section.id === 'more');
  const rssLink = moreSection.links.find((link) => link.id === 'rss');

  assert.equal(rssLink.href, rssHref);
  assert.equal(rssLink.external, true);
});

test('getNavLinks exposes only the remaining general links', () => {
  const sections = getNavLinks('/blog/rss.xml', (_id, message) => message);
  const serialized = JSON.stringify(sections);

  assert.deepEqual(sections.map((section) => section.id), ['more']);
  assert.doesNotMatch(serialized, /\/docs(?:\/|")/);
  assert.doesNotMatch(serialized, /\/blog\/tags\//);
});

test('removed knowledge navigation translations do not linger', () => {
  const root = path.resolve(__dirname, '..', '..', '..');
  for (const locale of ['en', 'zh-CN']) {
    const messages = JSON.parse(
      fs.readFileSync(path.join(root, 'i18n', locale, 'code.json'), 'utf8'),
    );
    for (const id of [
      'footer.frontend',
      'footer.knowledge',
      'footer.backend',
      'footer.operation',
      'footer.ai',
    ]) {
      assert.equal(messages[id], undefined);
    }
  }
});
