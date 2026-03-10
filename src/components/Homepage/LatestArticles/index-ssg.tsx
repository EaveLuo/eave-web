import { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate from '@docusaurus/Translate';
import { Calendar, FileText, ArrowRight } from 'lucide-react';
import styles from './styles.module.css';

// SSG 预渲染的文章数据类型
interface ArticleItem {
  id: string;
  title: string;
  description: string;
  date: string;
  path: string;
  type: 'blog' | 'doc';
  tags: string[];
}

interface HomepageData {
  latestArticles: {
    blogs: ArticleItem[];
    docs: ArticleItem[];
    lastUpdated: string;
  };
}

// 格式化日期
function formatDate(dateString: string, locale: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

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

// 卡片组件 - 带入场动效
function ArticleCard({ 
  article, 
  locale, 
  index,
  prefersReducedMotion 
}: { 
  article: ArticleItem; 
  locale: string;
  index: number;
  prefersReducedMotion: boolean;
}) {
  // 卡片入场动画变体
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        delay: index * 0.08, // 依次延迟，营造流畅感
      }
    },
  };

  return (
    <motion.article 
      className={styles.card}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={prefersReducedMotion ? undefined : cardVariants}
    >
      <Link to={article.path} className={styles.cardLink}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${article.type === 'blog' ? styles.badgeBlog : styles.badgeDoc}`}>
            {article.type === 'blog'
              ? <Translate id="homepage.latestArticles.badgeBlog">Blog</Translate>
              : <Translate id="homepage.latestArticles.badgeDoc">Doc</Translate>}
          </span>
          {article.date && (
            <time className={styles.date}>{formatDate(article.date, locale)}</time>
          )}
        </div>

        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.description}>{article.description}</p>

        {article.tags.length > 0 && (
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
  const prefersReducedMotion = useReducedMotion();

  // 获取 SSG 预渲染的数据 - 构建时就已经存在
  const homepageData = usePluginData('docusaurus-plugin-homepage-data') as HomepageData | undefined;

  const latestBlogs = useMemo(() => homepageData?.latestArticles?.blogs || [], [homepageData]);
  const latestDocs = useMemo(() => homepageData?.latestArticles?.docs || [], [homepageData]);

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

  // 查看更多链接动画
  const footerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const,
        delay: 0.3,
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
                  locale={currentLocale}
                  index={index}
                  prefersReducedMotion={prefersReducedMotion}
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
            variants={prefersReducedMotion ? undefined : footerVariants}
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
                  locale={currentLocale}
                  index={index}
                  prefersReducedMotion={prefersReducedMotion}
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
            variants={prefersReducedMotion ? undefined : footerVariants}
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
