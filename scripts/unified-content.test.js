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

  assert.equal(zh.length, 8);
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

test('the left Blog sidebar lists only the retained individual posts', () => {
  const configSource = fs.readFileSync(
    path.join(root, 'docusaurus.config.ts'),
    'utf8',
  );

  assert.match(configSource, /blogSidebarCount:\s*'ALL'/);
  assert.match(configSource, /onUntruncatedBlogPosts:\s*'ignore'/);
  assert.match(configSource, /'@docusaurus\/plugin-content-blog'/);
  assert.doesNotMatch(configSource, /\.\/src\/plugin\/plugin-content-blog/);

  for (const blogRoot of [zhRoot, enRoot]) {
    const tagRegistry = matter.engines.yaml.parse(
      fs.readFileSync(path.join(blogRoot, 'tags.yml'), 'utf8'),
    );

    for (const removedTag of [
      'go',
      'node-js',
      'webpack-5',
      'frontend',
      'linux',
      'website',
      'i18n',
      'release',
    ]) {
      assert.equal(tagRegistry[removedTag], undefined);
    }

    const retainedPosts = relativePosts(blogRoot);
    for (const removedPrefix of [
      'back-end/go/',
      'back-end/node/',
      'front-end/webpack5/',
    ]) {
      assert.equal(
        retainedPosts.some((post) => post.startsWith(removedPrefix)),
        false,
      );
    }
    assert.equal(
      retainedPosts.includes('operation/linux/通过SSH密钥登录主机.md'),
      false,
    );
    assert.equal(
      retainedPosts.some((post) => /^website\/\d+(?:\.\d+)+\.mdx?$/.test(post)),
      false,
    );

    for (const file of listMarkdown(blogRoot)) {
      const { data } = matter(fs.readFileSync(file, 'utf8'));
      assert.ok(data.tags.every((tag) => tagRegistry[tag]), `${file} has an orphan tag`);
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

  for (const redirect of [
    ['/docs/category/go', '/blog/tags/backend'],
    ['/docs/category/node', '/blog/tags/backend'],
    ['/docs/category/webpack-5', '/blog'],
    ['/docs/back-end/go/:path*', '/blog/tags/backend'],
    ['/docs/back-end/node/:path*', '/blog/tags/backend'],
    ['/docs/front-end/webpack5/:path*', '/blog'],
    ['/docs/operation/linux/:path*', '/blog/tags/operations'],
    ['/blog/back-end/go/:path*', '/blog/tags/backend'],
    ['/blog/back-end/node/:path*', '/blog/tags/backend'],
    ['/blog/front-end/webpack5/:path*', '/blog'],
    ['/blog/operation/linux/ssh-key-login-host', '/blog/tags/operations'],
    ['/blog/website/:path*', '/blog'],
    ['/en/docs/category/go', '/en/blog/tags/backend'],
    ['/en/docs/category/node', '/en/blog/tags/backend'],
    ['/en/docs/category/webpack-5', '/en/blog'],
    ['/en/docs/back-end/go/:path*', '/en/blog/tags/backend'],
    ['/en/docs/back-end/node/:path*', '/en/blog/tags/backend'],
    ['/en/docs/front-end/webpack5/:path*', '/en/blog'],
    ['/en/docs/operation/linux/:path*', '/en/blog/tags/operations'],
    ['/en/blog/back-end/go/:path*', '/en/blog/tags/backend'],
    ['/en/blog/back-end/node/:path*', '/en/blog/tags/backend'],
    ['/en/blog/front-end/webpack5/:path*', '/en/blog'],
    ['/en/blog/operation/linux/ssh-key-login-host', '/en/blog/tags/operations'],
    ['/en/blog/website/:path*', '/en/blog'],
  ]) {
    assert.equal(
      config.redirects.find((rule) => rule.source === redirect[0])?.destination,
      redirect[1],
    );
  }

  assert.ok(
    config.redirects.every(
      (rule) =>
        !/\/blog\/tags\/(?:frontend|node-js|linux|website|i18n|release)$/.test(
          rule.destination,
        ),
    ),
  );

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

test('article entry points keep readable copy and comfortable card sizing', () => {
  const zhTranslations = JSON.parse(
    fs.readFileSync(path.join(root, 'i18n', 'zh-CN', 'code.json'), 'utf8'),
  );

  for (const key of [
    'blogListPage.title',
    'blogListPage.viewTags',
    'homepage.latestArticles.readLatest',
  ]) {
    assert.ok(zhTranslations[key], `${key} is missing from zh-CN translations`);
    assert.doesNotMatch(zhTranslations[key].message, /\?{2,}|�/);
  }

  const homepageSource = fs.readFileSync(
    path.join(root, 'src', 'components', 'Homepage', 'LatestArticles', 'index.tsx'),
    'utf8',
  );
  assert.match(homepageSource, /const latestArticle = latestItems\[0\]/);
  assert.match(homepageSource, /to=\{latestArticle\.path\}/);

  const articleCardStyles = fs.readFileSync(
    path.join(root, 'src', 'components', 'ArticleCard', 'styles.module.css'),
    'utf8',
  );
  assert.doesNotMatch(articleCardStyles, /animation-timeline:\s*view\(\)/);

  const articleGridStyles = fs.readFileSync(
    path.join(root, 'src', 'components', 'BlogArticleGrid', 'styles.module.css'),
    'utf8',
  );
  assert.match(articleGridStyles, /lg:grid-cols-3/);
  assert.doesNotMatch(articleGridStyles, /xl:grid-cols-4/);
});

test('blog post pages use the responsive reading workspace', () => {
  const blogLayoutSource = fs.readFileSync(
    path.join(root, 'src', 'theme', 'BlogLayout', 'index.tsx'),
    'utf8',
  );
  const blogLayoutStyles = fs.readFileSync(
    path.join(root, 'src', 'theme', 'BlogLayout', 'styles.module.css'),
    'utf8',
  );
  const globalStyles = fs.readFileSync(
    path.join(root, 'src', 'css', 'custom.css'),
    'utf8',
  );
  assert.ok(
    globalStyles.includes(".navbar[class*='navbarHidden_']"),
    'the floating navbar needs an explicit hidden-state override',
  );
  assert.ok(
    globalStyles.includes(
      'calc(-100% - var(--site-navbar-gutter) - 2px)',
    ),
    'the hidden navbar transform needs to include its top gutter',
  );
  assert.ok(
    globalStyles.includes('box-shadow: none'),
    'the hidden navbar must not leave a glass shadow behind',
  );
  assert.match(
    globalStyles,
    /--site-navigation-overlay-z-index:\s*calc\(/,
    'navigation overlays need a shared top-layer token',
  );
  assert.match(
    globalStyles,
    /\.navbar\.navbar-sidebar--show\s*\{[^}]*z-index:\s*var\(--site-navigation-overlay-z-index\)/s,
    'the open mobile sidebar must sit above the floating article TOC',
  );
  assert.match(
    globalStyles,
    /\.navbar\.navbar-sidebar--show\s*\{[^}]*will-change:\s*auto/s,
    'the open mobile sidebar must use the viewport as its fixed-position containing block',
  );
  assert.match(
    globalStyles,
    /\.navbar\.navbar-sidebar--show\s*\{[^}]*backdrop-filter:\s*none/s,
    'the open mobile sidebar must not be contained by the navbar backdrop filter',
  );
  const navbarStyles = fs.readFileSync(
    path.join(root, 'src', 'theme', 'Navbar', 'styles.module.css'),
    'utf8',
  );
  const navbarLayoutSource = fs.readFileSync(
    path.join(root, 'src', 'theme', 'Navbar', 'Layout', 'index.tsx'),
    'utf8',
  );
  const blogPostHeaderSource = fs.readFileSync(
    path.join(root, 'src', 'theme', 'BlogPostItem', 'Header', 'index.tsx'),
    'utf8',
  );
  const tocSource = fs.readFileSync(
    path.join(root, 'src', 'theme', 'TOC', 'index.tsx'),
    'utf8',
  );
  const tocStyles = fs.readFileSync(
    path.join(root, 'src', 'theme', 'TOC', 'styles.module.css'),
    'utf8',
  );
  const sidebarSource = fs.readFileSync(
    path.join(root, 'src', 'theme', 'BlogSidebar', 'Desktop', 'index.tsx'),
    'utf8',
  );
  const sidebarStyles = fs.readFileSync(
    path.join(
      root,
      'src',
      'theme',
      'BlogSidebar',
      'Desktop',
      'styles.module.css',
    ),
    'utf8',
  );

  assert.match(blogLayoutSource, /styles\.sidebarSlot/);
  assert.match(blogLayoutSource, /styles\.articleColumn/);
  assert.match(blogLayoutSource, /styles\.tocSlot/);
  assert.match(blogLayoutSource, /styles\.sidebarCollapsed/);
  assert.match(blogLayoutStyles, /100vw/);
  assert.match(blogLayoutStyles, /100dvh/);
  assert.match(globalStyles, /--site-panel-radius:\s*1rem/);
  assert.match(globalStyles, /--liquid-glass-blur:\s*22px/);
  assert.match(globalStyles, /\.liquid-glass-surface/);
  assert.match(globalStyles, /backdrop-filter:\s*blur\(var\(--liquid-glass-blur\)\)/);
  assert.ok(navbarStyles.includes('@media (max-width: 1180px)'));
  assert.ok(navbarStyles.includes('@media (max-width: 540px)'));
  assert.ok(navbarStyles.includes(".mobileLeft :global(.navbar__toggle)"));
  assert.ok(navbarStyles.includes(".mobileRight > :global(.navbar__item)"));
  assert.ok(navbarStyles.includes('.DocSearch-Button-Placeholder'));
  assert.match(navbarLayoutSource, /getHashAnchor/);
  assert.match(navbarLayoutSource, /decodeURIComponent\(hashId\)/);
  assert.match(
    navbarStyles,
    /@media \(max-width: 540px\)[\s\S]*?\.mobileLeft :global\(\.navbar__logo\)\s*\{[^}]*display:\s*none/s,
    'small screens should hide the logo before hiding the full mobile brand',
  );
  assert.match(
    navbarStyles,
    /@media \(max-width: 540px\)[\s\S]*?\.mobileLeft :global\(\.navbar__title\)\s*\{[^}]*font-size:\s*clamp\(/s,
    'the mobile title should shrink continuously as the viewport narrows',
  );
  assert.match(
    navbarStyles,
    /@media \(max-width: 380px\)[\s\S]*?\.mobileLeft :global\(\.navbar__brand\)\s*\{[^}]*display:\s*none/s,
    'very small screens should hide the full mobile brand',
  );
  assert.match(
    globalStyles,
    /\.navbar\s*\{[^}]*border-radius:\s*var\(--site-panel-radius\)/s,
  );
  assert.match(blogLayoutStyles, /var\(--site-navbar-gutter\)/);
  assert.match(blogLayoutStyles, /var\(--article-sidebar-width\)/);
  assert.match(blogLayoutStyles, /--article-reading-width:\s*clamp\(/);
  assert.match(
    blogLayoutStyles,
    /max-width:\s*calc\([^;]*var\(--article-reading-width\)/s,
  );
  assert.match(
    blogLayoutStyles,
    /width:\s*min\(100%,\s*var\(--article-reading-width\)\)/,
  );
  assert.match(
    blogLayoutStyles,
    /--article-toc-width:\s*clamp\(14rem,\s*14vw,\s*16rem\)/,
  );
  assert.match(blogLayoutStyles, /@media \(max-width: 1180px\)/);
  assert.match(blogLayoutStyles, /@media \(max-width: 996px\)/);
  assert.match(blogLayoutStyles, /@media \(max-width: 576px\)/);
  assert.match(sidebarSource, /styles\.edgeToggle/);
  assert.match(sidebarSource, /useArticleSidebarState/);
  assert.doesNotMatch(sidebarSource, /styles\.toggleButton/);
  assert.match(sidebarStyles, /\.collapseHandle/);
  assert.match(sidebarStyles, /\.expandHandle/);
  assert.match(
    sidebarStyles,
    /border-radius:\s*var\(--site-panel-radius\)/,
  );
  assert.match(sidebarStyles, /max-height:\s*var\(--reading-rail-height\)/);
  assert.doesNotMatch(sidebarStyles, /height:\s*100%/);
  assert.match(
    blogLayoutStyles,
    /\.articleColumn\s+:global\(\.markdown\s*>\s*h2:first-child\)/,
  );
  assert.doesNotMatch(blogPostHeaderSource, /Header\/Authors/);
  assert.match(tocSource, /role="progressbar"/);
  assert.match(tocSource, /mobileProgressBarRef/);
  assert.match(tocSource, /styles\.mobileDock/);
  assert.match(tocSource, /article\.toc\.mobileTitle/);
  assert.match(tocSource, /article\.toc\.completed/);
  assert.match(tocSource, /import\('canvas-confetti'\)/);
  assert.doesNotMatch(tocSource, /styles\.mobilePanel/);
  assert.match(tocSource, /closeMobileOutlineAfterNavigation/);
  assert.match(tocSource, /liquid-glass-surface/);
  assert.match(tocSource, /MutationObserver/);
  assert.match(tocSource, /dataset\.navbarHidden/);
  assert.match(tocSource, /dataset\.sidebarOpen/);
  assert.match(tocStyles, /\.mobilePopover/);
  assert.match(tocStyles, /\.mobileDockProgressValue/);
  assert.match(
    tocStyles,
    /\.root\[data-navbar-hidden='true'\]\s+\.mobileDockTrigger/,
    'the dock must morph from the navbar into a standalone capsule',
  );
  assert.match(
    tocStyles,
    /\.root\[data-sidebar-open='true'\]\s+\.mobileDock\s*\{[^}]*pointer-events:\s*none/s,
    'the dock must weaken and stop intercepting taps while the sidebar is open',
  );
  assert.match(
    tocStyles,
    /@media \(max-width: 1180px\)[\s\S]*?\.mobileDock\s*\{[\s\S]*?position:\s*fixed/,
  );
  assert.doesNotMatch(tocStyles, /\.mobilePanel/);
  assert.ok(
    JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
      .dependencies['canvas-confetti'],
  );
  assert.match(
    tocStyles,
    /\.desktopPanel\s*\{[^}]*max-height:\s*var\(--reading-rail-height\)/s,
  );
  assert.match(
    tocStyles,
    /\.desktopPanel\s*\{[^}]*border-radius:\s*var\(--site-panel-radius\)/s,
  );
  assert.doesNotMatch(tocStyles, /\.desktopPanel\s*\{[^}]*height:\s*100%/s);

  const zhTranslations = JSON.parse(
    fs.readFileSync(path.join(root, 'i18n', 'zh-CN', 'code.json'), 'utf8'),
  );
  const enTranslations = JSON.parse(
    fs.readFileSync(path.join(root, 'i18n', 'en', 'code.json'), 'utf8'),
  );
  for (const key of [
    'article.sidebar.collapse',
    'article.sidebar.expand',
    'article.toc.title',
    'article.toc.progress',
    'article.toc.jumpHint',
    'article.toc.mobileTitle',
    'article.toc.completed',
  ]) {
    assert.ok(zhTranslations[key], `${key} is missing from zh-CN translations`);
    assert.ok(enTranslations[key], `${key} is missing from en translations`);
  }
});
