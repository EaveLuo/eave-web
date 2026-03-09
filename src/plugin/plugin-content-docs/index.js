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

// 读取文件的 front matter
function readDocFrontMatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    return {
      tags: data.tags || [],
      date: data.date || null,
    };
  } catch (error) {
    console.warn(`[DocsPlugin] Failed to read front matter from ${filePath}:`, error.message);
    return { tags: [], date: null };
  }
}

// 创建插件
function docsPluginEnhanced(context, options) {
  const { siteDir } = context;
  const docsPath = options.path || 'docs';
  const absoluteDocsPath = path.resolve(siteDir, docsPath);

  return {
    name: 'custom-docusaurus-plugin-content-docs',

    async loadContent() {
      // 读取所有文档文件
      const docFiles = getAllDocFiles(absoluteDocsPath);
      
      // 构建文档数据映射
      const docsMap = new Map();
      for (const { id, filePath } of docFiles) {
        const frontMatter = readDocFrontMatter(filePath);
        docsMap.set(id, {
          id,
          tags: frontMatter.tags,
          date: frontMatter.date,
        });
      }
      
      console.log('[DocsPlugin] Loaded front matter for', docsMap.size, 'docs');
      
      return { docsMap };
    },

    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      const { docsMap } = content;
      
      // 这里我们无法直接访问原始插件的 docs 数据
      // 所以我们创建一个独立的增强版本数据
      // 组件需要从两个插件获取数据并合并
      
      // 转换为数组格式
      const enhancedDocs = Array.from(docsMap.values()).map((doc) => ({
        id: doc.id,
        tags: doc.tags,
        date: doc.date,
      }));
      
      setGlobalData({
        enhancedDocs,
      });
      
      console.log('[DocsPlugin] Set global data with', enhancedDocs.length, 'enhanced docs');
    },
  };
}

module.exports = docsPluginEnhanced;
