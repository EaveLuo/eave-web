/**
 * 首页数据注入插件 - SSG 预渲染最新文章数据（支持多语言）
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

// 读取博客文章 - 支持多语言
function getBlogPosts(siteDir, locale, defaultLocale) {
  // 根据语言确定博客目录
  let blogDir;
  if (locale === defaultLocale) {
    // 默认语言：直接读取根目录
    blogDir = path.join(siteDir, 'blog');
  } else {
    // 其他语言：读取 i18n 目录
    blogDir = path.join(siteDir, 'i18n', locale, 'docusaurus-plugin-content-blog');
  }
  
  if (!fs.existsSync(blogDir)) {
    console.log(`[HomepageData] Blog dir not found: ${blogDir}`);
    return [];
  }

  const posts = [];

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
            // 提取 slug：去掉 .md 后缀
            const slugWithDate = relativePath.replace(/\.md$/, '').replace(/\/index$/, '');

            // 根据语言生成路径
            const pathPrefix = locale === defaultLocale ? '/blog' : `/${locale}/blog`;

            // 检查文件名是否包含日期后缀（如 -2026-03-12）
            const dateSuffixMatch = slugWithDate.match(/-(\d{4})-(\d{2})-(\d{2})$/);

            let permalink;
            if (dateSuffixMatch) {
              // 文件名包含日期后缀：Docusaurus 会生成 /blog/YYYY/MM/DD/slug- 格式
              // slug 是去掉日期后的部分，末尾加 -
              const slug = slugWithDate.replace(/-\d{4}-\d{2}-\d{2}$/, '') + '-';
              const year = dateSuffixMatch[1];
              const month = dateSuffixMatch[2];
              const day = dateSuffixMatch[3];
              permalink = `${pathPrefix}/${year}/${month}/${day}/${slug}`;
            } else {
              // 文件名不包含日期后缀：Docusaurus 直接使用文件名作为 slug
              permalink = `${pathPrefix}/${slugWithDate}`;
            }

            posts.push({
              id: slugWithDate,
              title: data.title || slugWithDate,
              description: extractDescription(data.description, body, 120),
              date: formatDate(data.date),
              path: permalink,
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

// 读取文档 - 支持多语言
function getDocs(siteDir, locale, defaultLocale) {
  // 根据语言确定文档目录
  let docsDir;
  if (locale === defaultLocale) {
    // 默认语言：直接读取根目录
    docsDir = path.join(siteDir, 'docs');
  } else {
    // 其他语言：读取 i18n 目录
    docsDir = path.join(siteDir, 'i18n', locale, 'docusaurus-plugin-content-docs', 'current');
  }

  if (!fs.existsSync(docsDir)) {
    console.log(`[HomepageData] Docs dir not found: ${docsDir}`);
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

            // 根据语言生成路径
            const pathPrefix = locale === defaultLocale ? '/docs' : `/${locale}/docs`;

            docs.push({
              id: slug,
              title: data.title || data.sidebar_label || slug,
              description: extractDescription(data.description, body, 120),
              date: formatDate(data.date),
              path: `${pathPrefix}/${slug}`,
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

// 读取文档分类 - 支持多语言
function getDocCategories(siteDir, locale, defaultLocale) {
  // 根据语言确定文档目录
  let docsDir;
  if (locale === defaultLocale) {
    docsDir = path.join(siteDir, 'docs');
  } else {
    docsDir = path.join(siteDir, 'i18n', locale, 'docusaurus-plugin-content-docs', 'current');
  }

  if (!fs.existsSync(docsDir)) {
    console.log(`[HomepageData] Docs dir not found for categories: ${docsDir}`);
    return [];
  }

  const categories = [];

  // 读取 docs 下的直接子目录
  const entries = fs.readdirSync(docsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const categoryDir = path.join(docsDir, entry.name);
      const introPath = path.join(categoryDir, 'intro.md');

      let title = entry.name;
      let description = '';
      let icon = 'FileText'; // 默认图标

      // 尝试读取 intro.md 获取标题和描述
      let frontmatterData = {};
      let hasIntroFile = false;
      if (fs.existsSync(introPath)) {
        try {
          const content = fs.readFileSync(introPath, 'utf-8');
          const { data, content: body } = matter(content);
          frontmatterData = data;
          hasIntroFile = true;

          // 优先使用 front matter 的 title，其次从 markdown 内容中的 # 标题提取
          if (data.title) {
            title = data.title;
          } else {
            // 从内容中提取第一个 # 标题
            const headingMatch = body.match(/^#\s+(.+)$/m);
            if (headingMatch) {
              title = headingMatch[1].trim();
            }
          }

          description = extractDescription(data.description, body, 150);
        } catch (error) {
          console.warn(`[HomepageData] Failed to read intro ${introPath}:`, error.message);
        }
      }

      // 检查必要字段
      const missingFields = [];
      if (!frontmatterData.icon) missingFields.push('icon');
      if (!frontmatterData.color) missingFields.push('color');

      if (missingFields.length > 0) {
        const errorMessage = `[HomepageData] ERROR: 文档分类 "${entry.name}" 的 intro.md 缺少必要字段: ${missingFields.join(', ')}\n` +
          `请确保 ${introPath} 的 front matter 中包含以下字段:\n` +
          `  - icon: 图标名称 (如: Code, Server, Cpu)\n` +
          `  - color: 主题色 (如: '#3b82f6')`;
        console.error(errorMessage);
        throw new Error(`文档分类 "${entry.name}" 配置不完整，请检查 intro.md 的 front matter`);
      }

      // 使用 front matter 中的 icon 和 color
      icon = frontmatterData.icon;
      const color = frontmatterData.color;

      // 根据语言生成路径
      const pathPrefix = locale === defaultLocale ? '/docs' : `/${locale}/docs`;

      // 扫描一级子目录
      const subCategories = [];
      try {
        const subEntries = fs.readdirSync(categoryDir, { withFileTypes: true });
        for (const subEntry of subEntries) {
          if (subEntry.isDirectory() && !subEntry.name.startsWith('_')) {
            const subDirPath = path.join(categoryDir, subEntry.name);
            const subIntroPath = path.join(subDirPath, 'intro.md');
            const subPrefacePath = path.join(subDirPath, 'preface.md');
            
            // 扫描子目录下的所有 markdown 文件，找到 sidebar_position 最小的
            let firstDocPath = null;
            let firstDocSlug = null;
            let minPosition = Infinity;
            
            try {
              const docFiles = fs.readdirSync(subDirPath, { withFileTypes: true })
                .filter(f => f.isFile() && f.name.endsWith('.md') && !f.name.startsWith('_'))
                .map(f => f.name);
              
              for (const docFile of docFiles) {
                const docPath = path.join(subDirPath, docFile);
                try {
                  const docContent = fs.readFileSync(docPath, 'utf-8');
                  const { data: docData } = matter(docContent);
                  const position = docData.sidebar_position || Infinity;
                  
                  if (position < minPosition) {
                    minPosition = position;
                    // 提取 slug：优先使用 front matter 的 slug，否则使用文件名（去掉 .md）
                    const fileName = docFile.replace(/\.md$/, '');
                    firstDocSlug = docData.slug || fileName;
                    firstDocPath = `${pathPrefix}/${entry.name}/${subEntry.name}/${firstDocSlug}`;
                  }
                } catch (e) {
                  // 忽略读取失败的文件
                }
              }
            } catch (e) {
              // 目录读取失败
            }
            
            // 优先读取 _category_.json 的 label
            const categoryJsonPath = path.join(subDirPath, '_category_.json');
            let subTitle = subEntry.name;
            
            if (fs.existsSync(categoryJsonPath)) {
              try {
                const categoryJson = JSON.parse(fs.readFileSync(categoryJsonPath, 'utf-8'));
                if (categoryJson.label) {
                  subTitle = categoryJson.label;
                }
              } catch (e) {
                // 使用目录名作为标题
              }
            }

            if (firstDocPath) {
              subCategories.push({
                id: subEntry.name,
                title: subTitle,
                path: firstDocPath,
              });
            }
          }
        }
      } catch (error) {
        console.warn(`[HomepageData] Failed to scan subdirectories for ${entry.name}:`, error.message);
      }

      categories.push({
        id: entry.name,
        title,
        description,
        icon,
        color,
        path: `${pathPrefix}/${entry.name}/intro`,
        subCategories: subCategories.sort((a, b) => a.id.localeCompare(b.id)),
      });
    }
  }

  // 按目录名排序，保持顺序稳定
  return categories.sort((a, b) => a.id.localeCompare(b.id));
}

// 创建插件
function homepageDataPlugin(context, options) {
  const { siteDir, i18n } = context;
  const currentLocale = i18n.currentLocale;
  const defaultLocale = i18n.defaultLocale;

  return {
    name: 'docusaurus-plugin-homepage-data',

    async loadContent() {
      console.log(`[HomepageData] Loading latest articles for locale: ${currentLocale}...`);

      // 读取最新博客和文档（根据当前语言）
      const latestBlogs = getBlogPosts(siteDir, currentLocale, defaultLocale);
      const latestDocs = getDocs(siteDir, currentLocale, defaultLocale);
      const docCategories = getDocCategories(siteDir, currentLocale, defaultLocale);

      console.log(`[HomepageData] Loaded ${latestBlogs.length} blogs, ${latestDocs.length} docs, ${docCategories.length} categories for ${currentLocale}`);

      return {
        latestBlogs,
        latestDocs,
        docCategories,
      };
    },

    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      const { latestBlogs, latestDocs, docCategories } = content;

      // 注入全局数据 - 这些将在 SSG 时预渲染到 HTML 中
      setGlobalData({
        latestArticles: {
          blogs: latestBlogs,
          docs: latestDocs,
          lastUpdated: new Date().toISOString(),
        },
        docCategories,
      });

      console.log(`[HomepageData] Global data injected for SSG (${currentLocale})`);
    },
  };
}

module.exports = homepageDataPlugin;
