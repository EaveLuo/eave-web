const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const LATEST_ARTICLES_LIMIT = 12;
const DATE_FILENAME_REGEX =
  /^(?<folder>.*)(?<date>\d{4}[-/]\d{1,2}[-/]\d{1,2})[-/]?(?<text>.*?)(?:\/index)?.mdx?$/;

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function joinUrlPath(...parts) {
  const segments = parts
    .filter(Boolean)
    .flatMap((part) => toPosixPath(String(part)).split('/'))
    .filter(Boolean);

  return `/${segments.join('/')}`;
}

function parseBlogSlug(relativePath) {
  const match = relativePath.match(DATE_FILENAME_REGEX);
  if (match) {
    const { folder, date, text } = match.groups;
    return `/${date.replace(/-/g, '/')}/${folder}${text}`;
  }

  return `/${relativePath.replace(/(?:\/index)?\.mdx?$/, '')}`;
}

function resolveBlogPermalink(
  relativePath,
  frontMatter,
  locale,
  defaultLocale,
) {
  const routeBasePath =
    locale === defaultLocale ? '/blog' : `/${locale}/blog`;
  const configuredSlug =
    typeof frontMatter.slug === 'string' ? frontMatter.slug.trim() : '';
  const normalizedRelativePath = toPosixPath(relativePath);
  const slug = configuredSlug
    ? configuredSlug.startsWith('/')
      ? configuredSlug
      : joinUrlPath(
          path.posix.dirname(normalizedRelativePath),
          configuredSlug,
        )
    : parseBlogSlug(normalizedRelativePath);

  return joinUrlPath(routeBasePath, slug);
}

function extractDescription(frontMatterDescription, content, maxLength = 120) {
  if (frontMatterDescription?.trim()) {
    return frontMatterDescription.length > maxLength
      ? `${frontMatterDescription
          .substring(0, maxLength)
          .replace(/\s+\S*$/, '')}...`
      : frontMatterDescription;
  }

  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
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

function getBlogDirectory(siteDir, locale, defaultLocale) {
  return locale === defaultLocale
    ? path.join(siteDir, 'blog')
    : path.join(
        siteDir,
        'i18n',
        locale,
        'docusaurus-plugin-content-blog',
      );
}

function loadTagRegistry(blogDir) {
  const tagsPath = path.join(blogDir, 'tags.yml');
  if (!fs.existsSync(tagsPath)) {
    return {};
  }

  return matter.engines.yaml.parse(fs.readFileSync(tagsPath, 'utf8'));
}

function resolveTags(tags, registry, locale, defaultLocale) {
  const tagBasePath =
    locale === defaultLocale ? '/blog/tags' : `/${locale}/blog/tags`;

  return (Array.isArray(tags) ? tags : []).map((tag) => {
    const id = typeof tag === 'string' ? tag : tag.label;
    const definition = registry[id] ?? {};
    const tagSlug = definition.permalink ?? tag.permalink ?? id;

    return {
      id,
      label: definition.label ?? tag.label ?? id,
      permalink: joinUrlPath(tagBasePath, tagSlug),
    };
  });
}

function listMarkdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listMarkdownFiles(fullPath);
    }
    return entry.isFile() && /\.mdx?$/.test(entry.name) ? [fullPath] : [];
  });
}

function readBlogArticles(siteDir, locale, defaultLocale) {
  const blogDir = getBlogDirectory(siteDir, locale, defaultLocale);
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const tagRegistry = loadTagRegistry(blogDir);
  const articles = listMarkdownFiles(blogDir).flatMap((file) => {
    const source = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(source);
    if (!data.date || data.draft === true || data.unlisted === true) {
      return [];
    }

    const relativePath = toPosixPath(path.relative(blogDir, file));
    const date = new Date(data.date);
    if (Number.isNaN(date.getTime())) {
      return [];
    }

    return [
      {
        id: relativePath.replace(/\.mdx?$/, ''),
        title: data.title,
        description: extractDescription(data.description, content),
        date: date.toISOString(),
        path: resolveBlogPermalink(
          relativePath,
          data,
          locale,
          defaultLocale,
        ),
        tags: resolveTags(data.tags, tagRegistry, locale, defaultLocale),
      },
    ];
  });

  return getLatestArticles(articles, articles.length);
}

function getLatestArticles(articles, limit = LATEST_ARTICLES_LIMIT) {
  return [...articles]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}

module.exports = {
  LATEST_ARTICLES_LIMIT,
  getLatestArticles,
  readBlogArticles,
  resolveBlogPermalink,
};
