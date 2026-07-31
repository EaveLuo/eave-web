const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const zhRoot = path.join(root, 'blog');
const enRoot = path.join(
  root,
  'i18n',
  'en',
  'docusaurus-plugin-content-blog',
);

function listMarkdown(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listMarkdown(fullPath);
    }

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
    const { data } = matter(fs.readFileSync(file, 'utf8'));

    assert.equal(typeof data.title, 'string', `${file} needs title`);
    assert.ok(data.description, `${file} needs description`);
    assert.ok(data.date, `${file} needs date`);
    assert.deepEqual(data.authors, ['eave'], `${file} needs the stable author id`);
    assert.ok(
      Array.isArray(data.tags) && data.tags.length > 0,
      `${file} needs tags`,
    );
    if (data.slug !== undefined) {
      assert.match(
        data.slug,
        /^\//,
        `${file} needs an absolute Blog slug to preserve its directory route`,
      );
    }

    for (const field of [
      'sidebar_position',
      'sidebar_label',
      'icon',
      'color',
      'categories',
      'author',
    ]) {
      assert.equal(data[field], undefined, `${file} still has ${field}`);
    }
  }
});


test('Vercel permanently redirects legacy Docs routes before catch-all rules', () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'),
  );

  assert.ok(config.redirects.every((rule) => rule.permanent === true));
  assert.deepEqual(config.redirects.slice(-2), [
    {
      source: '/docs/:path*',
      destination: '/blog/:path*',
      permanent: true,
    },
    {
      source: '/en/docs/:path*',
      destination: '/en/blog/:path*',
      permanent: true,
    },
  ]);

  for (const source of [
    '/docs',
    '/docs/front-end/intro',
    '/docs/category/node',
  ]) {
    assert.ok(
      config.redirects
        .slice(0, -2)
        .some((rule) => rule.source === source),
      `${source} needs an explicit redirect before the catch-all rules`,
    );
  }
});

test('runtime and article links no longer depend on Docs', () => {
  const sourceExtensions = /\.(?:js|jsx|ts|tsx)$/;
  const listSourceFiles = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listSourceFiles(fullPath);
      }
      return sourceExtensions.test(entry.name) ? [fullPath] : [];
    });

  const runtimeFiles = [
    path.join(root, 'docusaurus.config.ts'),
    ...listSourceFiles(path.join(root, 'src')),
  ];
  const runtimePattern =
    /docSidebar|plugin-content-docs|to=["']\/docs|to:\s*["']\/docs/;

  for (const file of runtimeFiles) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(
      source,
      runtimePattern,
      `${file} still contains Docs runtime configuration`,
    );
  }

  const articleFiles = [
    ...listMarkdown(zhRoot),
    ...listMarkdown(enRoot),
  ];
  for (const file of articleFiles) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(
      source,
      /\]\(\/docs(?:\/|[)#?])/,
      `${file} still contains an internal Docs link`,
    );
  }
});
