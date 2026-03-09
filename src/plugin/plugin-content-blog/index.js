// 自定义博客插件 - 将博客数据注入全局数据，使首页可以获取
// 此文件作为入口点，兼容 Docusaurus 的插件加载机制

// eslint-disable-next-line @typescript-eslint/no-require-imports
const blogPluginExports = require('@docusaurus/plugin-content-blog');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: blogPlugin } = blogPluginExports;

/**
 * 增强的博客插件 - 包装原始插件并注入全局数据
 * @param {import('@docusaurus/types').LoadContext} context - Docusaurus 加载上下文
 * @param {import('@docusaurus/plugin-content-blog').PluginOptions} options - 插件选项
 * @returns {Promise<import('@docusaurus/types').Plugin>} 插件实例
 */
async function blogPluginEnhanced(context, options) {
  const blogPluginInstance = await blogPlugin(context, options);

  return {
    ...blogPluginInstance,
    /**
     * 内容加载完成后执行 - 注入博客数据到全局
     * @param {Object} params - 参数对象
     * @param {import('@docusaurus/plugin-content-blog').BlogContent} params.content - 博客内容
     * @param {import('@docusaurus/types').PluginContentLoadedActions} params.actions - 操作函数
     */
    async contentLoaded({ content, actions }) {
      // 调用原始插件的 contentLoaded
      if (blogPluginInstance.contentLoaded) {
        await blogPluginInstance.contentLoaded({ content, actions });
      }

      // 将博客数据注入全局数据
      const { setGlobalData } = actions;
      const { blogPosts, blogTags } = content;

      setGlobalData({
        posts: blogPosts.map((post) => ({
          id: post.id,
          metadata: {
            title: post.metadata.title,
            date: post.metadata.date instanceof Date
              ? post.metadata.date.toISOString()
              : post.metadata.date,
            permalink: post.metadata.permalink,
            frontMatter: post.metadata.frontMatter || {},
            tags: post.metadata.tags || [],
          },
          content: post.content?.substring(0, 200) ?? '', // 只存储前200字符作为摘要
        })),
        postNum: blogPosts.length,
        tagNum: Object.keys(blogTags).length,
      });
    },
  };
}

module.exports = Object.assign({}, blogPluginExports, {
  default: blogPluginEnhanced,
});
