import { memo, type CSSProperties } from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { usePluginData } from '@docusaurus/useGlobalData';
import { ArrowRight, Sparkles } from 'lucide-react';
import styles from './styles.module.css';

type ArticleTag = string | { label?: string };

interface ArticleItem {
  id: string;
  title: string;
  description: string;
  date: string;
  path: string;
  type: 'blog' | 'doc';
  tags: ArticleTag[];
}

interface HomepageData {
  latestArticles: {
    items: ArticleItem[];
    lastUpdated: string;
  };
}

function formatDate(dateString: string): string {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTagLabel(tag: ArticleTag): string {
  if (typeof tag === 'string') {
    return tag;
  }

  if (tag?.label) {
    return tag.label;
  }

  return '';
}

function ArticleCard({
  article,
  index,
}: {
  article: ArticleItem;
  index: number;
}) {
  const tagLabels = article.tags.map(getTagLabel).filter(Boolean).slice(0, 3);

  return (
    <article
      className={styles.card}
      style={{ '--card-index': index } as CSSProperties}
    >
      <Link to={article.path} className={styles.cardLink}>
        <div className={styles.cardHeader}>
          <span
            className={`${styles.badge} ${
              article.type === 'blog' ? styles.badgeBlog : styles.badgeDoc
            }`}
          >
            {article.type === 'blog' ? (
              <Translate id="homepage.latestArticles.badgeBlog">Blog</Translate>
            ) : (
              <Translate id="homepage.latestArticles.badgeDoc">Doc</Translate>
            )}
          </span>
          {article.date && <time className={styles.date}>{formatDate(article.date)}</time>}
        </div>

        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.description}>
          {article.description || (
            <Translate id="homepage.latestArticles.noDescription">
              No description available
            </Translate>
          )}
        </p>

        {tagLabels.length > 0 && (
          <div className={styles.tags}>
            {tagLabels.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className={styles.readMore}>
          <Translate id="homepage.latestArticles.readMore">Read More</Translate>
          <ArrowRight size={14} />
        </div>
      </Link>
    </article>
  );
}

function LatestArticles() {
  const homepageData = usePluginData(
    'docusaurus-plugin-homepage-data',
  ) as HomepageData | undefined;

  const latestItems = homepageData?.latestArticles?.items ?? [];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            <Sparkles size={14} className={styles.eyebrowIcon} aria-hidden="true" />
            <span className={styles.eyebrowText}>
              <Translate id="homepage.latestArticles.sectionEyebrow">What&apos;s New</Translate>
            </span>
          </div>

          <h2 className={styles.sectionTitle}>
            <Translate id="homepage.latestArticles.sectionTitle">Latest Updates</Translate>
          </h2>

          <div className={styles.subtitleRow} aria-hidden="true">
            <span className={styles.subtitleLine} />
            <p className={styles.sectionSubtitle}>
              <Translate id="homepage.latestArticles.sectionSubtitle">
                Time never answers us, but it always leaves an echo.
              </Translate>
            </p>
            <span className={styles.subtitleLine} />
          </div>
        </header>

        {latestItems.length > 0 ? (
          <div className={styles.grid}>
            {latestItems.map((article, index) => (
              <ArticleCard
                key={`${article.type}-${article.id}`}
                article={article}
                index={index}
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
            <Translate id="homepage.latestArticles.noItems">No content yet</Translate>
          </p>
        )}

        <div className={styles.footer}>
          <Link to="/docs" className={styles.viewAllLink}>
            <Translate id="homepage.latestArticles.viewAllDocs">View All Docs</Translate>
            <ArrowRight size={16} />
          </Link>
          <Link to="/blog" className={styles.viewAllLink}>
            <Translate id="homepage.latestArticles.viewAllBlog">View All Blogs</Translate>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default memo(LatestArticles);
