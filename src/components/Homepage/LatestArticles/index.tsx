import { memo, type CSSProperties } from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { usePluginData } from '@docusaurus/useGlobalData';
import { ActionButton } from '@site/src/components/ActionButton';
import { ArrowRight, Sparkles } from 'lucide-react';
import styles from './styles.module.css';

interface ArticleTag {
  id: string;
  label: string;
  permalink: string;
}

interface ArticleItem {
  id: string;
  title: string;
  description: string;
  date: string;
  path: string;
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
      style={{ '--card-index': index } as CSSProperties}
    >
      <div className={styles.cardInner}>
        {article.date && (
          <div className={styles.cardHeader}>
            <time className={styles.date}>{formatDate(article.date)}</time>
          </div>
        )}

        <Link to={article.path} className={styles.articleLink}>
          <h3 className={styles.title}>{article.title}</h3>
          <p className={styles.description}>
            {article.description || (
              <Translate id="homepage.latestArticles.noDescription">
                No description available
              </Translate>
            )}
          </p>
        </Link>

        {article.tags.length > 0 && (
          <div className={styles.tags}>
            {article.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                to={tag.permalink}
                className={styles.tag}
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}

        <Link to={article.path} className={styles.readMore}>
          <Translate id="homepage.latestArticles.readMore">Read More</Translate>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
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
                key={article.id}
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
          <ActionButton to="/blog" icon={<ArrowRight size={16} aria-hidden="true" />}>
            <Translate id="homepage.latestArticles.viewAll">View All Articles</Translate>
          </ActionButton>
        </div>
      </div>
    </section>
  );
}

export default memo(LatestArticles);
