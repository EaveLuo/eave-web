// 自定义文档插件 - 将文档数据（包括 tags 和 date）注入全局数据
const docsPlugin = require('@docusaurus/plugin-content-docs');

async function docsPluginEnhanced(context, options) {
  // 创建原始插件实例
  const docsPluginInstance = await docsPlugin.default(context, options);

  return {
    ...docsPluginInstance,
    
    // 重写 contentLoaded 方法
    async contentLoaded({ content, allContent, actions }) {
      // 调用原始插件的 contentLoaded 来创建路由和 sidebars
      if (docsPluginInstance.contentLoaded) {
        await docsPluginInstance.contentLoaded({ content, allContent, actions });
      }

      // 然后覆盖全局数据，添加 tags 和 date
      const { setGlobalData } = actions;
      const { loadedVersions } = content;

      // 构建包含完整元数据的版本数据
      const enhancedVersions = loadedVersions.map((version) => {
        // 创建 docs 的映射，用于快速查找
        const docMap = new Map(version.docs.map(doc => [doc.id, doc]));
        
        const enhancedDocs = version.docs.map((doc) => {
          // 从 doc 中提取 frontMatter 数据
          const frontMatter = doc.frontMatter || {};
          
          return {
            id: doc.id,
            label: doc.label || doc.id,
            path: doc.path,
            sidebar: doc.sidebar,
            // 添加 frontMatter 中的 tags 和 date
            tags: frontMatter.tags || [],
            date: frontMatter.date || null,
            // 保留 lastUpdatedAt 作为后备
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
          // 保留 sidebars 数据
          sidebars: version.sidebars,
        };
      });

      setGlobalData({
        versions: enhancedVersions,
      });
    },
  };
}

// 导出所有原始插件的导出内容
module.exports = {
  ...docsPlugin,
  default: docsPluginEnhanced,
};
