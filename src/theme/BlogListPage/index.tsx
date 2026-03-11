import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';

import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Translate from '@docusaurus/Translate';
import SearchMetadata from '@theme/SearchMetadata';
import type { Props } from '@theme/BlogListPage';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import { Calendar, ArrowRight, Tag, Clock } from 'lucide-react';
import styles from './styles.module.css';

// 格式化日期
function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// 博客卡片组件
function BlogCard({
  post,
  index,
}: {
  post: {
    id: string;
    title: string;
    description?: string;
    date: string;
    permalink: string;
    tags: { label: string; permalink: string }[];
    readingTime?: number;
  };
  index: number;
}) {
  return (
    <article
      className={styles.card}
      style={{ '--card-index': index } as React.CSSProperties}
    >
      <Link to={post.permalink} className={styles.cardLink}>
        <div className={styles.cardHeader}>
          <span className={styles.badge}>
            <Translate id="blogListPage.badge">Blog</Translate>
          </span>
          <time className={styles.date}>{formatDate(post.date)}</time>
        </div>

        <h2 className={styles.title}>{post.title}</h2>
        {post.description && (
          <p className={styles.description}>{post.description}</p>
        )}

        {post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag.permalink} className={styles.tag}>
                <Tag size={12} />
                {tag.label}
              </span>
            ))}
          </div>
        )}

        <div className={styles.readMore}>
          <Translate id="blogListPage.readMore">阅读更多</Translate>
          <ArrowRight size={14} />
        </div>
      </Link>
    </article>
  );
}

function BlogListPageMetadata(props: Props): ReactNode {
  const { metadata } = props;
  const {
    siteConfig: { title: siteTitle },
  } = useDocusaurusContext();
  const { blogDescription, blogTitle, permalink } = metadata;
  const isBlogOnlyMode = permalink === '/';
  const title = isBlogOnlyMode ? siteTitle : blogTitle;
  return (
    <>
      <PageMetadata title={title} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent(props: Props): ReactNode {
  const { metadata, items } = props;
  const { totalPages, page } = metadata;

  // 提取博客数据
  const posts = items.map(({ content }) => {
    const { metadata } = content;
    return {
      id: metadata.permalink,
      title: metadata.title,
      description: metadata.description,
      date: metadata.date,
      permalink: metadata.permalink,
      tags: metadata.tags,
      readingTime: metadata.readingTime,
    };
  });

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          {/* 页面头部 */}
          <header className={styles.header}>
            <div className={styles.headerIcon}>
              <Calendar size={32} />
            </div>
            <h1 className={styles.headerTitle}>
              <Translate id="blogListPage.title">全部博客</Translate>
            </h1>
            <p className={styles.headerSubtitle}>
              <Translate id="blogListPage.subtitle">
                探索技术分享、经验总结与思考
              </Translate>
            </p>
          </header>

          {/* 博客网格 */}
          {posts.length > 0 ? (
            <div className={styles.grid}>
              {posts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>
                <Translate id="blogListPage.noPosts">暂无博客文章</Translate>
              </p>
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <nav className={styles.pagination}>
              {page > 1 && (
                <Link
                  to={page === 2 ? '/blog' : `/blog/page/${page - 1}`}
                  className={styles.paginationLink}
                >
                  <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
                  <Translate id="blogListPage.prev">上一页</Translate>
                </Link>
              )}
              <span className={styles.pageInfo}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  to={`/blog/page/${page + 1}`}
                  className={styles.paginationLink}
                >
                  <Translate id="blogListPage.next">下一页</Translate>
                  <ArrowRight size={16} />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function BlogListPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
