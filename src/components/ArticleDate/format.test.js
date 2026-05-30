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

const { formatArticleDate, getArticleDateTime } = require('./format.ts');

test('formatArticleDate keeps zh-CN article dates simple', () => {
  assert.equal(formatArticleDate('2026-04-08', 'zh-CN'), '2026-04-08');
});

test('formatArticleDate uses a concise English date', () => {
  assert.equal(formatArticleDate('2026-04-08', 'en'), 'Apr 8, 2026');
});

test('formatArticleDate normalizes timestamp input in UTC', () => {
  assert.equal(
    formatArticleDate('2024-06-28T09:10:57.000Z', 'zh-CN'),
    '2024-06-28'
  );
});

test('formatArticleDate ignores empty or invalid dates', () => {
  assert.equal(formatArticleDate('', 'zh-CN'), null);
  assert.equal(formatArticleDate('not-a-date', 'en'), null);
});

test('getArticleDateTime returns a stable machine-readable date', () => {
  assert.equal(getArticleDateTime('2026-04-08T09:10:57.000Z'), '2026-04-08');
  assert.equal(getArticleDateTime('not-a-date'), undefined);
});
