import type { ReactNode } from 'react';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';

export default function BlogPostItemHeader(): ReactNode {
  return (
    <header>
      <BlogPostItemHeaderTitle />
      <BlogPostItemHeaderInfo />
    </header>
  );
}
