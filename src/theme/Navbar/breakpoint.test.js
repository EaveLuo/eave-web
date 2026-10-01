const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const postcss = require('postcss');

const navbar = postcss.parse(
  fs.readFileSync(path.join(__dirname, 'styles.module.css'), 'utf8'),
);
const globalStyles = postcss.parse(
  fs.readFileSync(path.join(__dirname, '../../css/custom.css'), 'utf8'),
);

// Docusaurus/Infima mount and display the mobile sidebar only at <=996px.
// A wider CSS breakpoint exposes a toggle that opens an empty backdrop.
function displayAt(selector, width) {
  let display;
  navbar.walkRules(selector, (rule) => {
    if (rule.parent.type === 'atrule') {
      assert.equal(rule.parent.name, 'media');
      const maxWidth = rule.parent.params.match(/^\(max-width: (\d+)px\)$/);
      assert.ok(maxWidth, `Unexpected visibility query: ${rule.parent.params}`);
      if (width > Number(maxWidth[1])) return;
    }
    rule.walkDecls('display', (declaration) => {
      display = declaration.value;
    });
  });
  return display;
}

for (const width of [375, 768, 996, 997, 1024, 1180, 1181, 1280]) {
  test(`navbar matches sidebar availability at ${width}px`, () => {
    const mobile = width <= 996;
    assert.equal(displayAt('.mobileOnly', width), mobile ? 'contents' : 'none');
    assert.equal(displayAt('.desktopOnly', width), mobile ? 'none' : 'contents');
  });
}

test('tablet locale controls stop at the same mobile breakpoint', () => {
  const queries = [];
  navbar.walkAtRules('media', (rule) => {
    if (rule.params.includes('min-width: 768px')) queries.push(rule.params);
  });
  assert.deepEqual(queries, ['(min-width: 768px) and (max-width: 996px)']);
});

test('navigation overlay styles use the sidebar breakpoint', () => {
  const queries = [];
  globalStyles.walkRules('.navbar.navbar-sidebar--show', (rule) => {
    assert.equal(rule.parent.name, 'media');
    queries.push(rule.parent.params);
  });
  assert.deepEqual(queries, ['(max-width: 996px)']);
});
