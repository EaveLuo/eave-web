import { memo } from 'react';
import Translate from '@docusaurus/Translate';
import { usePluginData } from '@docusaurus/useGlobalData';
import { ActionButton } from '@site/src/components/ActionButton';
import ArticleCard from '@site/src/components/ArticleCard';
import { ArrowUpRight, Sparkles } from 'lucide-react';
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

function LatestArticles() {
  const homepageData = usePluginData(
    'docusaurus-plugin-homepage-data',
  ) as HomepageData | undefined;

  const latestItems = homepageData?.latestArticles?.items ?? [];
  const latestArticle = latestItems[0];

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
                permalink={article.path}
                index={index}
                headingLevel="h3"
              />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
            <Translate id="homepage.latestArticles.noItems">No content yet</Translate>
          </p>
        )}

        {latestArticle ? (
          <div className={styles.footer}>
            <ActionButton
              to={latestArticle.path}
              icon={<ArrowUpRight size={16} aria-hidden="true" />}
            >
              <Translate id="homepage.latestArticles.readLatest">
                Read Latest Article
              </Translate>
            </ActionButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default memo(LatestArticles);
