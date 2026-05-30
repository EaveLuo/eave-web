const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { Feed } = require('feed');
const { load: loadHtml } = require('cheerio');

const FEED_FILE_NAMES = {
  rss: 'rss.xml',
  atom: 'atom.xml',
  json: 'feed.json',
};

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function trimLeadingSlash(value) {
  return value.replace(/^\/+/, '');
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function joinUrlPath(...parts) {
  const normalized = parts
    .filter(Boolean)
    .map((part, index) => {
      const posixPart = toPosixPath(String(part));
      if (index === 0) {
        return trimTrailingSlash(posixPart) || '/';
      }
      return trimLeadingSlash(trimTrailingSlash(posixPart));
    })
    .filter((part, index) => !(index > 0 && !part));

  if (normalized.length === 0) {
    return '/';
  }

  return normalized.reduce((acc, part, index) => {
    if (index === 0) {
      return part;
    }
    return `${trimTrailingSlash(acc)}/${part}`;
  });
}

function normalizeFeedTypes(type) {
  if (!type) {
    return [];
  }

  if (type === 'all') {
    return ['rss', 'atom', 'json'];
  }

  return Array.isArray(type) ? type : [type];
}

function toAbsoluteUrl(siteConfig, permalink) {
  return new URL(permalink, siteConfig.url).toString();
}

function formatDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toCategories(tags = []) {
  return tags
    .map((tag) => {
      if (typeof tag === 'string') {
        return tag;
      }
      return tag?.label || tag?.name || '';
    })
    .filter(Boolean)
    .map((tag) => ({ name: tag, term: tag }));
}

function extractDescription(frontMatterDescription, content, maxLength = 160) {
  if (frontMatterDescription?.trim()) {
    return frontMatterDescription.length > maxLength
      ? `${frontMatterDescription.substring(0, maxLength).replace(/\s+\S*$/, '')}...`
      : frontMatterDescription;
  }

  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*?|__?)([^*_]+)\1/g, '$2')
    .replace(/^\s*[-*+\d.]\s+/gm, ' ')
    .replace(/^>\s?/gm, '')
    .replace(/^---+$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLength * 0.7
    ? `${truncated.substring(0, lastSpace)}...`
    : `${truncated}...`;
}

function resolveDocPermalink(relativePath, frontMatter, locale, defaultLocale) {
  const pathPrefix = locale === defaultLocale ? '/docs' : `/${locale}/docs`;
  const normalizedRelativePath = toPosixPath(relativePath).replace(/\.mdx?$/, '');
  const slugValue = typeof frontMatter.slug === 'string' ? frontMatter.slug.trim() : '';

  if (!slugValue) {
    return joinUrlPath(pathPrefix, normalizedRelativePath);
  }

  if (slugValue.startsWith('/')) {
    return joinUrlPath(pathPrefix, slugValue);
  }

  const pathSegments = normalizedRelativePath.split('/');
  pathSegments[pathSegments.length - 1] = slugValue;
  return joinUrlPath(pathPrefix, pathSegments.join('/'));
}

function getDocsDir(siteDir, locale, defaultLocale) {
  if (locale === defaultLocale) {
    return path.join(siteDir, 'docs');
  }

  return path.join(siteDir, 'i18n', locale, 'docusaurus-plugin-content-docs', 'current');
}

function collectDocsFeedItems({ siteDir, locale, defaultLocale, siteConfig }) {
  const docsDir = getDocsDir(siteDir, locale, defaultLocale);
  if (!fs.existsSync(docsDir)) {
    return [];
  }

  const items = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
        continue;
      }

      if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) {
        continue;
      }

      const fileBaseName = entry.name.replace(/\.mdx?$/, '');
      if (fileBaseName === 'intro' || entry.name.startsWith('_')) {
        continue;
      }

      try {
        const source = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(source);
        const date = formatDate(data.date);

        if (!date || data.draft || data.unlisted) {
          continue;
        }

        const relativePath = toPosixPath(path.relative(docsDir, fullPath));
        const permalink = resolveDocPermalink(relativePath, data, locale, defaultLocale);
        const title =
          data.title ||
          data.sidebar_label ||
          relativePath.replace(/\.mdx?$/, '');
        const description = extractDescription(data.description, content);
        const absoluteUrl = toAbsoluteUrl(siteConfig, permalink);

        items.push({
          title,
          id: absoluteUrl,
          link: absoluteUrl,
          date,
          description,
          content: description,
          category: toCategories(data.tags),
          permalink,
          sourceType: 'doc',
        });
      } catch (error) {
        console.warn(`[FullSiteFeed] Failed to read doc ${fullPath}:`, error.message);
      }
    }
  }

  traverse(docsDir);
  return items;
}

function collectBlogFeedItems({ blogPosts, siteConfig }) {
  return blogPosts
    .filter((post) => {
      const frontMatter = post.metadata.frontMatter || {};
      return !frontMatter.draft && !frontMatter.unlisted;
    })
    .map((post) => {
      const {
        title,
        permalink,
        date: rawDate,
        description,
        tags,
        authors,
      } = post.metadata;
      const date = formatDate(rawDate);
      const absoluteUrl = toAbsoluteUrl(siteConfig, permalink);
      const item = {
        title,
        id: absoluteUrl,
        link: absoluteUrl,
        date,
        description,
        content: description,
        category: toCategories(tags),
        permalink,
        sourceType: 'blog',
      };

      const feedAuthors = (authors || []).map((author) => ({
        name: author.name,
        link: author.url,
        email: author.email,
      }));
      if (feedAuthors.length > 0) {
        item.author = feedAuthors;
      }

      return item;
    })
    .filter((item) => item.date);
}

function collectFullSiteFeedItems({
  blogPosts,
  siteDir,
  locale,
  defaultLocale,
  siteConfig,
}) {
  const blogItems = collectBlogFeedItems({ blogPosts, siteConfig });
  const docItems = collectDocsFeedItems({
    siteDir,
    locale,
    defaultLocale,
    siteConfig,
  });

  return [...blogItems, ...docItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

function getRouteCandidates(permalink, siteConfig, locale, defaultLocale) {
  const candidates = new Set();
  const normalizedPermalink = trimLeadingSlash(permalink);
  candidates.add(normalizedPermalink);

  const baseUrl = siteConfig.baseUrl || '/';
  const normalizedBaseUrl = trimLeadingSlash(trimTrailingSlash(baseUrl));
  if (normalizedBaseUrl && normalizedPermalink.startsWith(`${normalizedBaseUrl}/`)) {
    candidates.add(normalizedPermalink.slice(normalizedBaseUrl.length + 1));
  }

  if (locale !== defaultLocale && normalizedPermalink.startsWith(`${locale}/`)) {
    candidates.add(normalizedPermalink.slice(locale.length + 1));
  }

  return Array.from(candidates).filter(Boolean);
}

function findOutputHtmlPath({ outDir, permalink, siteConfig, locale, defaultLocale }) {
  const routeCandidates = getRouteCandidates(permalink, siteConfig, locale, defaultLocale);

  for (const routeCandidate of routeCandidates) {
    const indexPath = path.join(outDir, routeCandidate, 'index.html');
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }

    const htmlPath = path.join(outDir, `${routeCandidate}.html`);
    if (fs.existsSync(htmlPath)) {
      return htmlPath;
    }
  }

  return null;
}

function readRenderedContent({
  outDir,
  item,
  siteConfig,
  locale,
  defaultLocale,
}) {
  if (!outDir || !item.permalink) {
    return item.content;
  }

  const htmlPath = findOutputHtmlPath({
    outDir,
    permalink: item.permalink,
    siteConfig,
    locale,
    defaultLocale,
  });

  if (!htmlPath) {
    return item.content;
  }

  try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const $ = loadHtml(html);
    const selector =
      item.sourceType === 'blog'
        ? '#__blog-post-container'
        : '.theme-doc-markdown, article .markdown';
    const article = $(selector).first();

    if (!article.length) {
      return item.content;
    }

    const itemUrl = item.link;
    article.find('a[href], img[src]').each((_, element) => {
      const attributes = element.attribs;
      if (attributes.href) {
        attributes.href = new URL(attributes.href, itemUrl).toString();
      }
      if (attributes.src) {
        attributes.src = new URL(attributes.src, itemUrl).toString();
      }
    });

    return article.html() || item.content;
  } catch (error) {
    console.warn(`[FullSiteFeed] Failed to read rendered HTML for ${item.link}:`, error.message);
    return item.content;
  }
}

function createFeed({ items, routeBasePath, locale, siteConfig, feedOptions }) {
  const feedLink = toAbsoluteUrl(siteConfig, joinUrlPath(siteConfig.baseUrl || '/', routeBasePath));
  const feed = new Feed({
    id: feedLink,
    title: feedOptions.title || siteConfig.title,
    updated: items[0]?.date,
    language: feedOptions.language || locale,
    link: feedLink,
    description: feedOptions.description || `${siteConfig.title} articles`,
    favicon: siteConfig.favicon
      ? toAbsoluteUrl(siteConfig, joinUrlPath(siteConfig.baseUrl || '/', siteConfig.favicon))
      : undefined,
    copyright: feedOptions.copyright || `Copyright ${siteConfig.title}`,
  });

  items.forEach((item) => feed.addItem(item));
  return feed;
}

async function writeFullSiteFeedFiles({
  items,
  outDir,
  routeBasePath,
  locale,
  defaultLocale,
  siteConfig,
  feedOptions,
}) {
  const feedTypes = normalizeFeedTypes(feedOptions.type);
  if (items.length === 0 || feedTypes.length === 0) {
    return;
  }

  const feedItems = items.map((item) => ({
    ...item,
    content: readRenderedContent({
      outDir,
      item,
      siteConfig,
      locale,
      defaultLocale,
    }),
  }));
  const feed = createFeed({
    items: feedItems,
    routeBasePath,
    locale,
    siteConfig,
    feedOptions,
  });
  const outputDir = path.join(outDir, routeBasePath);

  await fs.promises.mkdir(outputDir, { recursive: true });

  await Promise.all(
    feedTypes.map(async (feedType) => {
      const fileName = FEED_FILE_NAMES[feedType];
      if (!fileName) {
        return;
      }

      const outputPath = path.join(outputDir, fileName);
      const content =
        feedType === 'rss'
          ? feed.rss2()
          : feedType === 'atom'
            ? feed.atom1()
            : feed.json1();

      await fs.promises.writeFile(outputPath, content, 'utf8');
    }),
  );
}

module.exports = {
  collectFullSiteFeedItems,
  writeFullSiteFeedFiles,
  _internals: {
    collectDocsFeedItems,
    collectBlogFeedItems,
    joinUrlPath,
    resolveDocPermalink,
  },
};
