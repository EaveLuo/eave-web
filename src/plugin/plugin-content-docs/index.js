// 自定义文档插件 - 将文档 front matter（tags 和 date）注入全局数据
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 递归获取所有 .md 和 .mdx 文件
function getAllDocFiles(dir, baseDir = dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        // 计算相对于 baseDir 的 ID
        const relativePath = path.relative(baseDir, fullPath);
        const id = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/');
        files.push({ id, filePath: fullPath });
      }
    }
  }
  
  traverse(dir);
  return files;
}

// 读取文件的 front matter 和内容
function readDocContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    return {
      title: data.title || null,
      sidebar_label: data.sidebar_label || null,
      description: data.description || null,
      tags: data.tags || [],
      date: data.date || null,
      content: body?.trim() || '',
    };
  } catch (error) {
    console.warn(`[DocsPlugin] Failed to read content from ${filePath}:`, error.message);
    return { title: null, sidebar_label: null, description: null, tags: [], date: null, content: '' };
  }
}

// 创建插件
function docsPluginEnhanced(context, options) {
  const { siteDir, i18n } = context;
  const docsPath = options.path || 'docs';
  
  // 根据当前语言选择文档目录
  // i18n.currentLocale 在构建时会自动设置为当前构建的语言
  const currentLocale = i18n.currentLocale;
  
  // 如果是默认语言（zh-CN），使用 docs/ 目录
  // 否则使用 i18n/{locale}/docusaurus-plugin-content-docs/current/ 目录
  let absoluteDocsPath;
  if (currentLocale === 'zh-CN' || currentLocale === i18n.defaultLocale) {
    absoluteDocsPath = path.resolve(siteDir, docsPath);
  } else {
    absoluteDocsPath = path.resolve(siteDir, 'i18n', currentLocale, 'docusaurus-plugin-content-docs', 'current');
  }
  
  console.log(`[DocsPlugin] Loading docs for locale: ${currentLocale} from: ${absoluteDocsPath}`);

  return {
    name: 'custom-docusaurus-plugin-content-docs',

    async loadContent() {
      // 检查目录是否存在
      if (!fs.existsSync(absoluteDocsPath)) {
        console.log(`[DocsPlugin] Docs path does not exist: ${absoluteDocsPath}`);
        return { docsMap: new Map() };
      }
      
      // 读取所有文档文件
      const docFiles = getAllDocFiles(absoluteDocsPath);
      
      // 构建文档数据映射
      const docsMap = new Map();
      for (const { id, filePath } of docFiles) {
        const docContent = readDocContent(filePath);
        docsMap.set(id, {
          id,
          title: docContent.title || docContent.sidebar_label || id,
          description: docContent.description,
          tags: docContent.tags,
          date: docContent.date,
          content: docContent.content,
        });
      }
      
      console.log('[DocsPlugin] Loaded front matter for', docsMap.size, 'docs');
      
      return { docsMap };
    },

    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      const { docsMap } = content;
      
      // 转换为数组格式
      const enhancedDocs = Array.from(docsMap.values()).map((doc) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        tags: doc.tags,
        date: doc.date,
        content: doc.content,
      }));
      
      setGlobalData({
        enhancedDocs,
      });
      
      console.log(`[DocsPlugin] Set global data for locale ${currentLocale} with`, enhancedDocs.length, 'enhanced docs');
    },
  };
}

module.exports = docsPluginEnhanced;
