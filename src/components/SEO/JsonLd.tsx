import React from 'react';
import Head from '@docusaurus/Head';

interface PersonSchema {
  '@type': 'Person';
  name: string;
  url: string;
  jobTitle?: string;
  sameAs?: string[];
}

interface WebSiteSchema {
  '@type': 'Website';
  name: string;
  url: string;
  description?: string;
  author?: PersonSchema;
}

interface ArticleSchema {
  '@type': 'TechArticle';
  headline: string;
  description: string;
  author: PersonSchema;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

interface JsonLdProps {
  type: 'website' | 'article' | 'person';
  data: WebSiteSchema | ArticleSchema | PersonSchema;
}

/**
 * JSON-LD 结构化数据组件
 * 用于 SEO 优化，帮助搜索引擎理解页面内容
 */
export default function JsonLd({ type, data }: JsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    ...data,
  };

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Head>
  );
}

/**
 * 创建 Person Schema
 */
export function createPersonSchema(options: {
  name: string;
  url: string;
  jobTitle?: string;
  sameAs?: string[];
}): PersonSchema {
  return {
    '@type': 'Person',
    name: options.name,
    url: options.url,
    jobTitle: options.jobTitle,
    sameAs: options.sameAs,
  };
}

/**
 * 创建 WebSite Schema
 */
export function createWebsiteSchema(options: {
  name: string;
  url: string;
  description?: string;
  author?: PersonSchema;
}): WebSiteSchema {
  return {
    '@type': 'Website',
    name: options.name,
    url: options.url,
    description: options.description,
    author: options.author,
  };
}

/**
 * 创建 Article Schema
 */
export function createArticleSchema(options: {
  headline: string;
  description: string;
  author: PersonSchema;
  datePublished: string;
  dateModified?: string;
  image?: string;
}): ArticleSchema {
  return {
    '@type': 'TechArticle',
    headline: options.headline,
    description: options.description,
    author: options.author,
    datePublished: options.datePublished,
    dateModified: options.dateModified,
    image: options.image,
  };
}
