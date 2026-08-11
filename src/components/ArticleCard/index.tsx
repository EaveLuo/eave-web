import type { CSSProperties } from 'react';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { ArrowUpRight, CalendarDays } from 'lucide-react';

import styles from './styles.module.css';

export interface ArticleCardTag {
  label: string;
  permalink: string;
}

export interface ArticleCardItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  tags: ArticleCardTag[];
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

export default function ArticleCard({
  article,
  permalink,
  index,
  headingLevel = 'h2',
}: {
  article: ArticleCardItem;
  permalink: string;
  index: number;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  const visibleTags = article.tags.slice(0, 2);
  const remainingTagCount = article.tags.length - visibleTags.length;
  const formattedDate = formatDate(article.date);

  return (
    <article
      className={styles.card}
      style={{ '--card-index': index } as CSSProperties}
    >
      <div className={styles.cardInner}>
        <div className={styles.metaRow}>
          {formattedDate ? (
            <time dateTime={article.date} className={styles.date}>
              <CalendarDays size={14} aria-hidden="true" />
              {formattedDate}
            </time>
          ) : (
            <span />
          )}
          <span className={styles.sequence} aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <Link to={permalink} className={styles.articleLink}>
          <Heading className={styles.title}>{article.title}</Heading>
          {article.description ? (
            <p className={styles.description}>{article.description}</p>
          ) : null}
        </Link>

        <div className={styles.footerRow}>
          <div className={styles.tags}>
            {visibleTags.map((tag) => (
              <Link
                key={tag.permalink}
                to={tag.permalink}
                className={styles.tag}
              >
                {tag.label}
              </Link>
            ))}
            {remainingTagCount > 0 ? (
              <span className={styles.moreTags} aria-hidden="true">
                +{remainingTagCount}
              </span>
            ) : null}
          </div>

          <Link to={permalink} className={styles.readMore}>
            <Translate id="homepage.latestArticles.readMore">
              Read More
            </Translate>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
