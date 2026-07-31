import type { ReactNode } from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import { useBlogTagsPostsPageTitle } from '@docusaurus/theme-common/internal';
import Layout from '@theme/Layout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import type { Props } from '@theme/BlogTagsPostsPage';
import { Tag, Tags } from 'lucide-react';
import { ActionButton } from '@site/src/components/ActionButton';
import { BackButton } from '@site/src/components/BackButton';
import BlogArticleGrid, {
  type BlogArticle,
} from '@site/src/components/BlogArticleGrid';
import { sortArticlesNewestFirst } from '@site/src/components/BlogArticleGrid/sort';

import styles from './styles.module.css';

function BlogTagsPostsPageMetadata({ tag }: Props): ReactNode {
  const title = useBlogTagsPostsPageTitle(tag);
  return (
    <>
      <PageMetadata title={title} description={tag.description} />
      <SearchMetadata tag="blog_tags_posts" />
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

function BlogTagsPostsPageContent({
  tag,
  items,
  listMetadata,
}: Props): ReactNode {
  const title = useBlogTagsPostsPageTitle(tag);
  const articles = toArticles(items);

  return (
    <Layout>
      <main className={styles.pageContainer}>
        <div className={styles.container}>
          {tag.unlisted && <Unlisted />}
          <header className={styles.header}>
            <div className={styles.headerIcon}>
              <Tag size={32} aria-hidden="true" />
            </div>
            <h1 className={styles.headerTitle}>{title}</h1>
            {tag.description && (
              <p className={styles.headerSubtitle}>{tag.description}</p>
            )}
            <div className={styles.headerActions}>
              <ActionButton
                to={tag.allTagsPath}
                icon={<Tags size={16} aria-hidden="true" />}
              >
                <Translate
                  id="theme.tags.tagsPageLink"
                  description="The label of the link targeting the tag list page"
                >
                  View All Tags
                </Translate>
              </ActionButton>
            </div>
          </header>

          <BlogArticleGrid articles={articles} />

          <div className={styles.pagination}>
            <BlogListPaginator metadata={listMetadata} />
          </div>
          <BackButton />
        </div>
      </main>
    </Layout>
  );
}

export default function BlogTagsPostsPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagPostListPage,
      )}
    >
      <BlogTagsPostsPageMetadata {...props} />
      <BlogTagsPostsPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
