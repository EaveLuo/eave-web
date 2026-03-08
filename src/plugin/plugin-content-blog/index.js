// 自定义博客插件 - 将博客数据注入全局数据，使首页可以获取
// eslint-disable-next-line @typescript-eslint/no-require-imports
const blogPluginExports = require('@docusaurus/plugin-content-blog')
const { default: blogPlugin } = blogPluginExports

async function blogPluginEnhanced(context, options) {
  const blogPluginInstance = await blogPlugin(context, options)

  return {
    ...blogPluginInstance,
    async contentLoaded({ content, allContent, actions }) {
      // 调用原始插件的 contentLoaded
      await blogPluginInstance.contentLoaded({ content, allContent, actions })

      // 将博客数据注入全局数据
      const { setGlobalData } = actions
      const { blogPosts, blogTags } = content

      setGlobalData({
        posts: blogPosts.map(post => ({
          id: post.id,
          metadata: {
            title: post.metadata.title,
            date: post.metadata.date,
            permalink: post.metadata.permalink,
            frontMatter: post.metadata.frontMatter,
            tags: post.metadata.tags,
          },
          content: post.content?.substring(0, 200), // 只存储前200字符作为摘要
        })),
        postNum: blogPosts.length,
        tagNum: Object.keys(blogTags).length,
      })
    },
  }
}

module.exports = Object.assign({}, blogPluginExports, {
  default: blogPluginEnhanced,
})
