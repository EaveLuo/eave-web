import { memo } from 'react';
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

// 格式化日期 - 使用统一格式避免 hydration 不匹配
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 卡片组件 - 纯 CSS 滚动触发动画
function ArticleCard({ 
  article, 
  index,
}: { 
  article: ArticleItem;
  index: number;
}) {
  return (
    <article 
      className={styles.card}
      style={{ '--card-index': index } as React.CSSProperties}
    >
      <Link to={article.path} className={styles.cardLink}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${article.type === 'blog' ? styles.badgeBlog : styles.badgeDoc}`}>
            {article.type === 'blog'
              ? <Translate id="homepage.latestArticles.badgeBlog">Blog</Translate>
              : <Translate id="homepage.latestArticles.badgeDoc">Doc</Translate>}
          </span>
          {article.date && (
            <time className={styles.date}>{formatDate(article.date)}</time>
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
    </article>
  );
}

function LatestArticles() {
  const { i18n } = useDocusaurusContext();
  const currentLocale = i18n.currentLocale;

  const homepageData = usePluginData('docusaurus-plugin-homepage-data') as HomepageData | undefined;

  // 直接读取数据，无需 useMemo（构建时数据已确定）
  const latestBlogs = homepageData?.latestArticles?.blogs || [];
  const latestDocs = homepageData?.latestArticles?.docs || [];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* 博客模块 */}
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
                <ArticleCard 
                  key={article.id} 
                  article={article}
                  index={index}
                />
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

        {/* 文档模块 */}
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
                <ArticleCard 
                  key={article.id} 
                  article={article}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>
              <Translate id="homepage.latestArticles.noDocs">暂无文档</Translate>
            </p>
          )}

          <div className={styles.moduleFooter}>
            <Link to="/docs" className={styles.viewAllLink}>
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
