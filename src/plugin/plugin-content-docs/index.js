// 自定义文档插件 - 将文档 front matter（tags 和 date）注入全局数据
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

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
  
  // 存储 front matter 数据
  const frontMatterCache = new Map();

  return {
    name: 'custom-docusaurus-plugin-content-docs',
    
    // 在加载内容时读取 front matter
    async loadContent() {
      // 这里不需要做什么，因为原始的 docs 插件会处理内容加载
      return {};
    },

    // 在所有内容加载完成后，注入 front matter 到全局数据
    async allContentLoaded({ allContent, actions }) {
      const { setGlobalData } = actions;
      
      // 获取原始 docs 插件的全局数据
      const docsPluginId = options.id || 'default';
      const docsData = allContent['docusaurus-plugin-content-docs']?.[docsPluginId];
      
      if (!docsData?.loadedVersions) {
        console.log('[DocsPlugin] No docs data found');
        return;
      }

      // 构建包含 front matter 的版本数据
      const enhancedVersions = docsData.loadedVersions.map((version) => {
        const enhancedDocs = version.docs.map((doc) => {
          // 构建文件路径
          // doc.id 格式如: "back-end/go/变量与常量"
          // 需要找到对应的文件
          const possiblePaths = [
            path.join(absoluteDocsPath, `${doc.id}.md`),
            path.join(absoluteDocsPath, `${doc.id}.mdx`),
            path.join(absoluteDocsPath, doc.id, 'index.md'),
            path.join(absoluteDocsPath, doc.id, 'index.mdx'),
          ];
          
          let frontMatter = { tags: [], date: null };
          for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
              frontMatter = readDocFrontMatter(filePath);
              break;
            }
          }
          
          return {
            id: doc.id,
            label: doc.label || doc.id,
            path: doc.path,
            sidebar: doc.sidebar,
            tags: frontMatter.tags,
            date: frontMatter.date,
            lastUpdatedAt: doc.lastUpdatedAt,
          };
        });

        return {
          name: version.versionName,
          label: version.versionLabel,
          isLast: version.isLast,
          path: version.path,
          mainDocId: version.mainDoc?.id || '',
          docs: enhancedDocs,
        };
      });

      // 设置全局数据
      setGlobalData({
        versions: enhancedVersions,
      });
      
      console.log('[DocsPlugin] Injected front matter data for', 
        enhancedVersions.reduce((sum, v) => sum + v.docs.length, 0), 
        'docs');
    },
  };
}

module.exports = docsPluginEnhanced;
