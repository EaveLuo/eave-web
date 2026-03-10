import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
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
  title: string | null;
  description: string | null;
  tags: string[];
  date: string | null;
  content?: string;
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

// 提取纯文本描述（优先使用 frontMatter description，否则从内容提取）
function extractDescription(frontMatterDesc: string | undefined, content: string | undefined, maxLength: number = 120): string {
  // 优先使用 frontMatter 的 description
  if (frontMatterDesc?.trim()) {
    return frontMatterDesc.length > maxLength 
      ? frontMatterDesc.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
      : frontMatterDesc;
  }
  
  if (!content?.trim()) {
    return translate({ id: 'homepage.latestArticles.noDescription', message: '暂无描述' });
  }
  
  // 使用正则表达式移除 markdown 符号
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')           // 代码块
    .replace(/`[^`]*`/g, ' ')                  // 行内代码
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')     // 图片
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // 链接 [text](url) -> text
    .replace(/<[^>]+>/g, ' ')                  // HTML 标签
    .replace(/^#{1,6}\s+/gm, '')              // 标题符号
    .replace(/(\*\*?|__?)([^*_]+)\1/g, '$2')  // 粗体/斜体
    .replace(/^\s*[-*+\d.]\s+/gm, ' ')        // 列表符号
    .replace(/^>\s?/gm, '')                   // 引用符号
    .replace(/^---+$/gm, ' ')                 // 水平线
    .replace(/\s+/g, ' ')                     // 合并空白
    .trim();
  
  // 智能截断：在 maxLength 附近找最后一个空格
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // 如果最后一个空格在合理位置（不小于70%），就在那里截断
  return lastSpace > maxLength * 0.7 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
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
  
  return useMemo(() => {
    if (!blogData?.posts) return [];
    
    return blogData.posts
      .slice(0, limit)
      .map((post) => {
        const frontMatter = post.metadata.frontMatter;
        const description = extractDescription(
          frontMatter?.description as string | undefined,
          post.content,
          120
        );
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
  }, [blogData, limit]);
}

// 获取文档文章
function useLatestDocs(limit: number): ArticleItem[] {
  // 获取原始插件的文档数据（包含 path, label 等）
  const defaultDocsData = usePluginData('docusaurus-plugin-content-docs', 'default') as GlobalPluginData | undefined;
  // 获取增强插件的 front matter 数据（包含 tags, date）
  const enhancedData = usePluginData('custom-docusaurus-plugin-content-docs', 'enhanced') as EnhancedPluginData | undefined;
  
  return useMemo(() => {
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
      .map((doc) => {
        const enhanced = enhancedMap.get(doc.id);
        return {
          ...doc,
          enhanced,
          sortDate: enhanced?.date 
            ? new Date(enhanced.date).getTime()
            : doc.lastUpdatedAt 
              ? doc.lastUpdatedAt * 1000
              : 0,
        };
      })
      .sort((a: any, b: any) => b.sortDate - a.sortDate)
      .slice(0, limit)
      .map((doc: any) => {
        const enhanced = doc.enhanced;
        return {
          id: doc.id,
          title: enhanced?.title || doc.label || doc.id,
          description: extractDescription(enhanced?.description, enhanced?.content, 120),
          date: enhanced?.date 
            ? new Date(enhanced.date).toISOString()
            : doc.lastUpdatedAt 
              ? new Date(doc.lastUpdatedAt * 1000).toISOString()
              : '',
          path: doc.path,
          type: 'doc' as const,
          tags: enhanced?.tags || [],
        };
      });
  }, [defaultDocsData, enhancedData, limit]);
}

// 简化的卡片组件 - 使用 CSS 动画替代 Framer Motion
function ArticleCard({ article, index, locale }: { article: ArticleItem; index: number; locale: string }) {
  const cardRef = useRef<HTMLElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInView) {
      // 使用 RAF 批量处理动画
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, index * 50); // 减少延迟时间
      return () => clearTimeout(timeout);
    }
  }, [isInView, index]);

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${isVisible ? styles.cardVisible : styles.cardHidden}`}
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
    </article>
  );
}

function LatestArticles() {
  const { i18n } = useDocusaurusContext();
  const currentLocale = i18n.currentLocale;
  const prefersReducedMotion = useReducedMotion();
  
  const blogPosts = useLatestBlogPosts(6);
  const docs = useLatestDocs(6);
  
  const latestBlogs = useMemo(() => blogPosts.slice(0, 6), [blogPosts]);
  const latestDocs = useMemo(() => docs.slice(0, 6), [docs]);

  // 模块标题动画
  const moduleHeaderVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      }
    },
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* 博客模块 */}
        <div className={styles.module}>
          <motion.div 
            className={styles.moduleHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={prefersReducedMotion ? undefined : moduleHeaderVariants}
          >
            <div className={styles.moduleTitleWrapper}>
              <Calendar size={24} className={styles.moduleIcon} />
              <h2 className={styles.moduleTitle}>
                <Translate id="homepage.latestArticles.blogTitle">最新博客</Translate>
              </h2>
            </div>
            <p className={styles.moduleSubtitle}>
              <Translate id="homepage.latestArticles.blogSubtitle">探索最新的技术分享与思考</Translate>
            </p>
          </motion.div>

          {latestBlogs.length > 0 ? (
            <div className={styles.grid}>
              {latestBlogs.map((article, index) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  index={index} 
                  locale={currentLocale} 
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>
              <Translate id="homepage.latestArticles.noBlogPosts">暂无博客文章</Translate>
            </p>
          )}

          <motion.div 
            className={styles.moduleFooter}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={prefersReducedMotion ? undefined : moduleHeaderVariants}
          >
            <Link to="/blog" className={styles.viewAllLink}>
              <Translate id="homepage.latestArticles.viewAllBlog">查看全部博客</Translate>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* 文档模块 */}
        <div className={styles.module}>
          <motion.div 
            className={styles.moduleHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={prefersReducedMotion ? undefined : moduleHeaderVariants}
          >
            <div className={styles.moduleTitleWrapper}>
              <FileText size={24} className={styles.moduleIconDoc} />
              <h2 className={styles.moduleTitle}>
                <Translate id="homepage.latestArticles.docsTitle">最新文档</Translate>
              </h2>
            </div>
            <p className={styles.moduleSubtitle}>
              <Translate id="homepage.latestArticles.docsSubtitle">浏览最新的技术文档与教程</Translate>
            </p>
          </motion.div>

          {latestDocs.length > 0 ? (
            <div className={styles.grid}>
              {latestDocs.map((article, index) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  index={index} 
                  locale={currentLocale} 
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>
              <Translate id="homepage.latestArticles.noDocs">暂无文档</Translate>
            </p>
          )}

          <motion.div 
            className={styles.moduleFooter}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={prefersReducedMotion ? undefined : moduleHeaderVariants}
          >
            <Link to="/docs/front-end/intro" className={styles.viewAllLink}>
              <Translate id="homepage.latestArticles.viewAllDocs">查看全部文档</Translate>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(LatestArticles);
