import ArticleCard from '@site/src/components/ArticleCard';
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

export default function BlogArticleGrid({
  articles,
}: {
  articles: BlogArticle[];
}) {
  return (
    <div className={styles.grid}>
      {articles.map((article, index) => (
        <ArticleCard
          key={article.id}
          article={article}
          permalink={article.permalink}
          index={index}
        />
      ))}
    </div>
  );
}
