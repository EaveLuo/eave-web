import type { CSSProperties } from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { ArrowRight, Tag } from 'lucide-react';
import styles from './styles.module.css';

export interface BlogArticle {
  id: string;
  title: string;
  description?: string;
  date: string;
  permalink: string;
  tags: Array<{
    label: string;
    permalink: string;
  }>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function BlogArticleCard({
  article,
  index,
}: {
  article: BlogArticle;
  index: number;
}) {
  return (
    <article
      className={styles.card}
      style={{ '--card-index': index } as CSSProperties}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardHeader}>
          <time dateTime={article.date} className={styles.date}>
            {formatDate(article.date)}
          </time>
        </div>

        <Link to={article.permalink} className={styles.articleLink}>
          <h2 className={styles.title}>{article.title}</h2>
          {article.description && (
            <p className={styles.description}>{article.description}</p>
          )}
        </Link>

        {article.tags.length > 0 && (
          <div className={styles.tags}>
            {article.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.permalink}
                to={tag.permalink}
                className={styles.tag}
              >
                <Tag size={12} aria-hidden="true" />
                {tag.label}
              </Link>
            ))}
          </div>
        )}

        <Link to={article.permalink} className={styles.readMore}>
          <Translate id="homepage.latestArticles.readMore">
            Read More
          </Translate>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function BlogArticleGrid({
  articles,
}: {
  articles: BlogArticle[];
}) {
  return (
    <div className={styles.grid}>
      {articles.map((article, index) => (
        <BlogArticleCard
          key={article.id}
          article={article}
          index={index}
        />
      ))}
    </div>
  );
}
