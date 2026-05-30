const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });

  module._compile(outputText, filename);
};

const { getNavLinks } = require('./links.ts');

test('getNavLinks uses the locale-aware RSS href provided by the footer', () => {
  const rssHref = '/en/blog/rss.xml';
  const sections = getNavLinks(rssHref, (id, message) => message);
  const moreSection = sections.find((section) => section.id === 'more');
  const rssLink = moreSection.links.find((link) => link.id === 'rss');

  assert.equal(rssLink.href, rssHref);
  assert.equal(rssLink.external, true);
});
