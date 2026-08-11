import type { ReactNode } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import Translate from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type { Props } from '@theme/BlogListPage';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import { Calendar, Tags } from 'lucide-react';
import { ActionButton } from '@site/src/components/ActionButton';
import { BackButton } from '@site/src/components/BackButton';
import BlogArticleGrid, {
  type BlogArticle,
} from '@site/src/components/BlogArticleGrid';
import { sortArticlesNewestFirst } from '@site/src/components/BlogArticleGrid/sort';

import styles from './styles.module.css';

function BlogListPageMetadata(props: Props): ReactNode {
  const { metadata } = props;
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();
  const { blogDescription, blogTitle, permalink } = metadata;
  const title = permalink === '/' ? siteTitle : blogTitle;

  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function toArticles(items: Props['items']): BlogArticle[] {
  return sortArticlesNewestFirst(
    items.map(({ content }) => {
      const { metadata } = content;
      return {
        id: metadata.permalink,
        title: metadata.title,
        description: metadata.description,
        date: metadata.date,
        permalink: metadata.permalink,
        tags: metadata.tags.map(({ label, permalink }) => ({
          label,
          permalink,
        })),
      };
    }),
  );
}

function BlogListPageContent({ metadata, items }: Props): ReactNode {
  const articles = toArticles(items);

  return (
    <Layout>
      <main className={styles.pageContainer}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.headerIcon}>
              <Calendar size={32} aria-hidden="true" />
            </div>
            <h1 className={styles.headerTitle}>
              <Translate id="blogListPage.title">All Articles</Translate>
            </h1>
            <p className={styles.headerSubtitle}>
              <Translate id="blogListPage.subtitle">
                Explore technical notes, experience, and ideas.
              </Translate>
            </p>
            <div className={styles.headerActions}>
              <ActionButton
                to="/blog/tags"
                icon={<Tags size={16} aria-hidden="true" />}
              >
                <Translate id="blogListPage.viewTags">
                  Browse by Tag
                </Translate>
              </ActionButton>
            </div>
          </header>

          {articles.length > 0 ? (
            <BlogArticleGrid articles={articles} />
          ) : (
            <p className={styles.emptyState}>
              <Translate id="blogListPage.noPosts">
                No articles yet
              </Translate>
            </p>
          )}

          <div className={styles.pagination}>
            <BlogListPaginator metadata={metadata} />
          </div>
          <BackButton />
        </div>
      </main>
    </Layout>
  );
}

export default function BlogListPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
