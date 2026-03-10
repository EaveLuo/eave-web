import { memo, useMemo, useEffect, useRef, useState } from 'react';
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

// 卡片组件 - 使用 IntersectionObserver + CSS 实现滚动触发
function ArticleCard({ 
  article, 
  locale, 
  index,
}: { 
  article: ArticleItem; 
  locale: string;
  index: number;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const delay = index * 0.08;

  useEffect(() => {
    // 使用 IntersectionObserver 检测是否进入视口
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // 触发一次后断开
        }
      },
      { 
        threshold: 0.1, // 10% 可见时触发
        rootMargin: '0px 0px -50px 0px' // 提前触发
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <article 
      ref={cardRef}
      className={`${styles.card} ${isVisible ? styles.cardVisible : ''}`}
      style={{ '--card-delay': `${delay}s` } as React.CSSProperties}
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
    </article>
  );
}

// 模块头部组件 - 同样使用 IntersectionObserver
function ModuleHeader({ 
  icon: Icon, 
  iconClassName,
  titleId, 
  subtitleId,
  titleDefault,
  subtitleDefault 
}: { 
  icon: typeof Calendar;
  iconClassName: string;
  titleId: string;
  subtitleId: string;
  titleDefault: string;
  subtitleDefault: string;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={headerRef}
      className={`${styles.moduleHeader} ${isVisible ? styles.moduleHeaderVisible : ''}`}
    >
      <div className={styles.moduleTitleWrapper}>
        <Icon size={24} className={iconClassName} />
        <h2 className={styles.moduleTitle}>
          <Translate id={titleId}>{titleDefault}</Translate>
        </h2>
      </div>
      <p className={styles.moduleSubtitle}>
        <Translate id={subtitleId}>{subtitleDefault}</Translate>
      </p>
    </div>
  );
}

// 底部链接组件
function ModuleFooter({ href, textId, textDefault }: { href: string; textId: string; textDefault: string }) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={footerRef}
      className={`${styles.moduleFooter} ${isVisible ? styles.moduleFooterVisible : ''}`}
    >
      <Link to={href} className={styles.viewAllLink}>
        <Translate id={textId}>{textDefault}</Translate>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function LatestArticles() {
  const { i18n } = useDocusaurusContext();
  const currentLocale = i18n.currentLocale;

  // 获取 SSG 预渲染的数据
  const homepageData = usePluginData('docusaurus-plugin-homepage-data') as HomepageData | undefined;

  const latestBlogs = useMemo(() => homepageData?.latestArticles?.blogs || [], [homepageData]);
  const latestDocs = useMemo(() => homepageData?.latestArticles?.docs || [], [homepageData]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* 博客模块 */}
        <div className={styles.module}>
          <ModuleHeader 
            icon={Calendar}
            iconClassName={styles.moduleIcon}
            titleId="homepage.latestArticles.blogTitle"
            subtitleId="homepage.latestArticles.blogSubtitle"
            titleDefault="最新博客"
            subtitleDefault="探索最新的技术分享与思考"
          />

          {latestBlogs.length > 0 ? (
            <div className={styles.grid}>
              {latestBlogs.map((article, index) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  locale={currentLocale}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>
              <Translate id="homepage.latestArticles.noBlogPosts">暂无博客文章</Translate>
            </p>
          )}

          <ModuleFooter 
            href="/blog"
            textId="homepage.latestArticles.viewAllBlog"
            textDefault="查看全部博客"
          />
        </div>

        {/* 文档模块 */}
        <div className={styles.module}>
          <ModuleHeader 
            icon={FileText}
            iconClassName={styles.moduleIconDoc}
            titleId="homepage.latestArticles.docsTitle"
            subtitleId="homepage.latestArticles.docsSubtitle"
            titleDefault="最新文档"
            subtitleDefault="浏览最新的技术文档与教程"
          />

          {latestDocs.length > 0 ? (
            <div className={styles.grid}>
              {latestDocs.map((article, index) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  locale={currentLocale}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>
              <Translate id="homepage.latestArticles.noDocs">暂无文档</Translate>
            </p>
          )}

          <ModuleFooter 
            href="/docs/front-end/intro"
            textId="homepage.latestArticles.viewAllDocs"
            textDefault="查看全部文档"
          />
        </div>
      </div>
    </section>
  );
}

export default memo(LatestArticles);
