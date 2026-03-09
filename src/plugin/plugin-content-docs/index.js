// 自定义文档插件 - 将文档数据（包括 tags 和 date）注入全局数据
const docsPluginExports = require('@docusaurus/plugin-content-docs');
const { default: docsPlugin } = docsPluginExports;

async function docsPluginEnhanced(context, options) {
  const docsPluginInstance = await docsPlugin(context, options);

  return {
    ...docsPluginInstance,
    async contentLoaded({ content, allContent, actions }) {
      // 先调用原始插件的 contentLoaded
      if (docsPluginInstance.contentLoaded) {
        await docsPluginInstance.contentLoaded({ content, allContent, actions });
      }

      // 然后覆盖全局数据，添加 tags 和 date
      const { setGlobalData } = actions;
      const { loadedVersions } = content;

      // 构建包含完整元数据的版本数据
      const enhancedVersions = loadedVersions.map((version) => {
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
        };
      });

      setGlobalData({
        versions: enhancedVersions,
      });
    },
  };
}

module.exports = Object.assign({}, docsPluginExports, {
  default: docsPluginEnhanced,
});
