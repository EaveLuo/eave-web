import type { ReactNode } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import { formatArticleDate, getArticleDateTime } from './format';
import styles from './styles.module.css';

type Props = {
  date: unknown;
};

export default function ArticleDate({ date }: Props): ReactNode {
  const { i18n } = useDocusaurusContext();
  const formattedDate = formatArticleDate(date, i18n.currentLocale);
  const dateTime = getArticleDateTime(date);

  if (!formattedDate || !dateTime) {
    return null;
  }

  return (
    <p className={styles.articleDate}>
      <time dateTime={dateTime}>{formattedDate}</time>
    </p>
  );
}
