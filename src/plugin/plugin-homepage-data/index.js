/**
 * 首页数据注入插件 - SSG 预渲染最新文章数据
 * 在构建时将最新博客和文档数据注入全局数据，实现秒开体验
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 提取纯文本描述（优先使用 frontMatter description，否则从内容提取）
function extractDescription(frontMatterDesc, content, maxLength = 120) {
  // 优先使用 frontMatter 的 description
  if (frontMatterDesc?.trim()) {
    return frontMatterDesc.length > maxLength
      ? frontMatterDesc.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
      : frontMatterDesc;
  }

  if (!content?.trim()) {
    return '';
  }

  // 使用正则表达式移除 markdown 符号
  const text = content
    .replace(/```[\s\S]*?```/g, ' ') // 代码块
    .replace(/`[^`]*`/g, ' ') // 行内代码
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ') // 图片
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接 [text](url) -> text
    .replace(/<[^>]+>/g, ' ') // HTML 标签
    .replace(/^#{1,6}\s+/gm, '') // 标题符号
    .replace(/(\*\*?|__?)([^*_]+)\1/g, '$2') // 粗体/斜体
    .replace(/^\s*[-*+\d.]\s+/gm, ' ') // 列表符号
    .replace(/^>\s?/gm, '') // 引用符号
    .replace(/^---+$/gm, ' ') // 水平线
    .replace(/\s+/g, ' ') // 合并空白
    .trim();

  // 智能截断
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > maxLength * 0.7
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString();
}

// 读取博客文章
function getBlogPosts(siteDir, locale) {
  const blogDir = path.join(siteDir, 'blog');
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const posts = [];
  const currentYear = new Date().getFullYear();

  // 递归读取博客目录
  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const { data, content: body } = matter(content);

          // 只读取有日期的文章
          if (data.date) {
            const relativePath = path.relative(blogDir, fullPath);
            const slug = relativePath.replace(/\.md$/, '').replace(/\/index$/, '');

            posts.push({
              id: slug,
              title: data.title || slug,
              description: extractDescription(data.description, body, 120),
              date: formatDate(data.date),
              path: `/blog/${slug}`,
              type: 'blog',
              tags: data.tags || [],
            });
          }
        } catch (error) {
          console.warn(`[HomepageData] Failed to read blog ${fullPath}:`, error.message);
        }
      }
    }
  }

  traverse(blogDir);

  // 按日期排序，取最新的 6 篇
  return posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
}

// 读取文档
function getDocs(siteDir, locale) {
  const docsDir = path.join(siteDir, 'docs');
  if (!fs.existsSync(docsDir)) {
    return [];
  }

  const docs = [];

  // 递归读取文档目录
  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const { data, content: body } = matter(content);

          // 只读取有日期且不是 intro 的文档
          if (data.date && !entry.name.includes('intro')) {
            const relativePath = path.relative(docsDir, fullPath);
            const slug = relativePath.replace(/\.md$/, '');

            docs.push({
              id: slug,
              title: data.title || data.sidebar_label || slug,
              description: extractDescription(data.description, body, 120),
              date: formatDate(data.date),
              path: `/docs/${slug}`,
              type: 'doc',
              tags: data.tags || [],
            });
          }
        } catch (error) {
          console.warn(`[HomepageData] Failed to read doc ${fullPath}:`, error.message);
        }
      }
    }
  }

  traverse(docsDir);

  // 按日期排序，取最新的 6 篇
  return docs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);
}

// 创建插件
function homepageDataPlugin(context, options) {
  const { siteDir, i18n } = context;

  return {
    name: 'docusaurus-plugin-homepage-data',

    async loadContent() {
      const currentLocale = i18n.currentLocale;

      console.log('[HomepageData] Loading latest articles...');

      // 读取最新博客和文档
      const latestBlogs = getBlogPosts(siteDir, currentLocale);
      const latestDocs = getDocs(siteDir, currentLocale);

      console.log(`[HomepageData] Loaded ${latestBlogs.length} blogs, ${latestDocs.length} docs`);

      return {
        latestBlogs,
        latestDocs,
      };
    },

    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      const { latestBlogs, latestDocs } = content;

      // 注入全局数据 - 这些将在 SSG 时预渲染到 HTML 中
      setGlobalData({
        latestArticles: {
          blogs: latestBlogs,
          docs: latestDocs,
          lastUpdated: new Date().toISOString(),
        },
      });

      console.log('[HomepageData] Global data injected for SSG');
    },
  };
}

module.exports = homepageDataPlugin;
