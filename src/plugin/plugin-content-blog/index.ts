// 自定义博客插件 - 将博客数据注入全局数据，使首页可以获取
import type { LoadContext, Plugin, PluginContentLoadedActions } from '@docusaurus/types';
import type {
  BlogContent,
  BlogPost,
  BlogPostMetadata,
  PluginOptions as BlogPluginOptions,
} from '@docusaurus/plugin-content-blog';

// 导入原始博客插件
import blogPlugin from '@docusaurus/plugin-content-blog';

// 博客文章摘要数据
interface PostSummary {
  id: string;
  metadata: {
    title: string;
    date: string;
    permalink: string;
    frontMatter: Record<string, unknown>;
    tags: Array<{ label: string; permalink: string }>;
  };
  content: string;
}

// 全局博客数据结构
interface BlogGlobalData {
  posts: PostSummary[];
  postNum: number;
  tagNum: number;
}

// 增强的博客插件选项类型
interface EnhancedBlogPluginOptions extends BlogPluginOptions {
  // 可以在这里添加自定义选项
}

// contentLoaded 参数类型
interface ContentLoadedParams {
  content: BlogContent;
  actions: PluginContentLoadedActions;
}

// 增强的博客插件
export default async function blogPluginEnhanced(
  context: LoadContext,
  options: EnhancedBlogPluginOptions,
): Promise<Plugin<BlogContent>> {
  const blogPluginInstance = await blogPlugin(context, options);

  return {
    ...blogPluginInstance,

    async contentLoaded({ content, actions }: ContentLoadedParams): Promise<void> {
      // 调用原始插件的 contentLoaded
      if (blogPluginInstance.contentLoaded) {
        await blogPluginInstance.contentLoaded({ content, actions });
      }

      // 将博客数据注入全局数据
      const { setGlobalData } = actions;
      const { blogPosts, blogTags } = content;

      const globalData: BlogGlobalData = {
        posts: blogPosts.map((post: BlogPost) => {
          const metadata = post.metadata as BlogPostMetadata;
          return {
            id: post.id,
            metadata: {
              title: metadata.title,
              date: metadata.date.toISOString(),
              permalink: metadata.permalink,
              frontMatter: metadata.frontMatter ?? {},
              tags: metadata.tags ?? [],
            },
            content: post.content?.substring(0, 200) ?? '', // 只存储前200字符作为摘要
          };
        }),
        postNum: blogPosts.length,
        tagNum: Object.keys(blogTags).length,
      };

      setGlobalData(globalData);
    },
  };
}
