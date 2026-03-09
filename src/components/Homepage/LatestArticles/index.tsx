import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate, { translate } from '@docusaurus/Translate';
import { Calendar, FileText, ArrowRight } from 'lucide-react';
import styles from './styles.module.css';

// 定义文档相关的类型（原始插件数据）
interface GlobalDoc {
  id: string;
  label: string;
  path: string;
  sidebar?: string;
  lastUpdatedAt?: number;
}

interface GlobalVersion {
  docs: GlobalDoc[];
}

interface GlobalPluginData {
  versions: GlobalVersion[];
}

// 定义增强文档数据（自定义插件注入）
interface EnhancedDoc {
  id: string;
  tags: string[];
  date: string | null;
}

interface EnhancedPluginData {
  enhancedDocs: EnhancedDoc[];
}

interface ArticleItem {
  id: string;
  title: string;
  description: string;
  date: string;
  path: string;
  type: 'blog' | 'doc';
  tags?: string[];
}

// Tag 显示函数 - 直接返回原 tag（保持和博客一致，不翻译）
function displayTag(tag: string): string {
  return tag;
}

// 格式化日期 - 使用 Docusaurus 当前语言
function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  // 映射 Docusaurus 语言代码到浏览器语言代码
  const localeMap: Record<string, string> = {
    'zh-CN': 'zh-CN',
    'en': 'en-US',
  };
  const browserLocale = localeMap[locale] || locale;
  return date.toLocaleDateString(browserLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// 获取博客文章 - 使用自定义插件注入的全局数据
function useLatestBlogPosts(limit: number): ArticleItem[] {
  const blogData = usePluginData('docusaurus-plugin-content-blog') as {
    posts: Array<{
      id: string;
      metadata: {
        title: string;
        date: string;
        permalink: string;
        frontMatter: Record<string, unknown>;
        tags?: Array<{ label: string }>;
      };
      content?: string;
    }>;
    postNum: number;
    tagNum: number;
  } | undefined;
  
  console.log('[LatestArticles] Blog data:', blogData ? `found ${blogData.posts?.length || 0} posts` : 'not found');
  
  if (!blogData?.posts) return [];
  
  return blogData.posts
    .slice(0, limit)
    .map((post) => {
      const frontMatter = post.metadata.frontMatter;
      const description = (frontMatter?.description as string) || 
                         (post.content?.substring(0, 120) + '...') || 
                         translate({ id: 'homepage.latestArticles.noDescription', message: '暂无描述' });
      return {
        id: post.id,
        title: post.metadata.title,
        description,
        date: String(post.metadata.date),
        path: post.metadata.permalink,
        type: 'blog' as const,
        tags: post.metadata.tags?.map(tag => tag.label) || [],
      };
    });
}

// 获取文档文章
function useLatestDocs(limit: number): ArticleItem[] {
  // 获取原始插件的文档数据（包含 path, label 等）
  const defaultDocsData = usePluginData('docusaurus-plugin-content-docs', 'default') as GlobalPluginData | undefined;
  // 获取增强插件的 front matter 数据（包含 tags, date）
  const enhancedData = usePluginData('custom-docusaurus-plugin-content-docs', 'enhanced') as EnhancedPluginData | undefined;
  
  console.log('[LatestArticles] Docs data:', defaultDocsData ? 'found' : 'not found', 'versions:', defaultDocsData?.versions?.length || 0);
  console.log('[LatestArticles] Enhanced data:', enhancedData ? 'found' : 'not found', 'docs:', enhancedData?.enhancedDocs?.length || 0);
  
  if (!defaultDocsData?.versions) return [];
  
  const latestVersion = defaultDocsData.versions[0];
  if (!latestVersion?.docs) return [];
  
  // 构建增强数据映射
  const enhancedMap = new Map<string, EnhancedDoc>();
  if (enhancedData?.enhancedDocs) {
    for (const doc of enhancedData.enhancedDocs) {
      enhancedMap.set(doc.id, doc);
    }
  }
  
  return latestVersion.docs
    .filter((doc) => doc.id !== 'intro')
    .slice(0, limit)
    .map((doc) => {
      // 查找对应的增强数据
      const enhanced = enhancedMap.get(doc.id);
      
      return {
        id: doc.id,
        title: doc.label || doc.id,
        description: translate({ id: 'homepage.latestArticles.docDescription', message: '技术文档' }),
        // 使用增强插件的 front matter 数据
        date: enhanced?.date 
          ? new Date(enhanced.date).toISOString()
          : doc.lastUpdatedAt 
            ? new Date(doc.lastUpdatedAt * 1000).toISOString()
            : '',
        path: doc.path,
        type: 'doc' as const,
        // 直接使用原始 tags（保持和博客一致，不翻译）
        tags: enhanced?.tags || [],
      };
    });
}

function ArticleCard({ article, index, locale }: { article: ArticleItem; index: number; locale: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={styles.card}
    >
      <Link to={article.path} className={styles.cardLink}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${article.type === 'blog' ? styles.badgeBlog : styles.badgeDoc}`}>
            {article.type === 'blog' 
              ? translate({ id: 'homepage.latestArticles.badgeBlog', message: 'Blog' })
              : translate({ id: 'homepage.latestArticles.badgeDoc', message: 'Doc' })}
          </span>
          {article.date && (
            <time className={styles.date}>{formatDate(article.date, locale)}</time>
          )}
        </div>
        
        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.description}>{article.description}</p>
        
        {article.tags && article.tags.length > 0 && (
          <div className={styles.tags}>
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
        
        <div className={styles.readMore}>
          <Translate id="homepage.latestArticles.readMore">阅读更多</Translate>
          <ArrowRight size={14} />
        </div>
      </Link>
    </motion.article>
  );
}

function LatestArticles() {
  const { i18n } = useDocusaurusContext();
  const currentLocale = i18n.currentLocale;
  
  const blogPosts = useLatestBlogPosts(6);
  const docs = useLatestDocs(6);
  
  console.log('[LatestArticles] Render:', { blogs: blogPosts.length, docs: docs.length });
  
  // 合并并按日期排序，取前6个博客和6个文档分别展示
  const latestBlogs = useMemo(() => blogPosts.slice(0, 6), [blogPosts]);
  const latestDocs = useMemo(() => docs.slice(0, 6), [docs]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* 博客模块 - 始终显示 */}
        <div className={styles.module}>
          <div className={styles.moduleHeader}>
            <div className={styles.moduleTitleWrapper}>
              <Calendar size={24} className={styles.moduleIcon} />
              <h2 className={styles.moduleTitle}>
                <Translate id="homepage.latestArticles.blogTitle">最新博客</Translate>
              </h2>
            </div>
            <p className={styles.moduleSubtitle}>
              <Translate id="homepage.latestArticles.blogSubtitle">探索最新的技术分享与思考</Translate>
            </p>
          </div>

          {latestBlogs.length > 0 ? (
            <div className={styles.grid}>
              {latestBlogs.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} locale={currentLocale} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>
              <Translate id="homepage.latestArticles.noBlogPosts">暂无博客文章</Translate>
            </p>
          )}

          <div className={styles.moduleFooter}>
            <Link to="/blog" className={styles.viewAllLink}>
              <Translate id="homepage.latestArticles.viewAllBlog">查看全部博客</Translate>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 文档模块 - 始终显示 */}
        <div className={styles.module}>
          <div className={styles.moduleHeader}>
            <div className={styles.moduleTitleWrapper}>
              <FileText size={24} className={styles.moduleIconDoc} />
              <h2 className={styles.moduleTitle}>
                <Translate id="homepage.latestArticles.docsTitle">最新文档</Translate>
              </h2>
            </div>
            <p className={styles.moduleSubtitle}>
              <Translate id="homepage.latestArticles.docsSubtitle">浏览最新的技术文档与教程</Translate>
            </p>
          </div>

          {latestDocs.length > 0 ? (
            <div className={styles.grid}>
              {latestDocs.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} locale={currentLocale} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>
              <Translate id="homepage.latestArticles.noDocs">暂无文档</Translate>
            </p>
          )}

          <div className={styles.moduleFooter}>
            <Link to="/docs/front-end/intro" className={styles.viewAllLink}>
              <Translate id="homepage.latestArticles.viewAllDocs">查看全部文档</Translate>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(LatestArticles);
