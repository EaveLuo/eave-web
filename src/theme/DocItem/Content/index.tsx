/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { type ComponentProps, type ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXComponents from '@theme/MDXComponents';
import MDXHeading from '@theme/MDXComponents/Heading';
import type { Props } from '@theme/DocItem/Content';

import ArticleDate from '@site/src/components/ArticleDate';

/**
 Title can be declared inside md content or declared through
 front matter and added manually. To make both cases consistent,
 the added title is added under the same div.markdown block
 See https://github.com/facebook/docusaurus/pull/4882#issuecomment-853021120

 We render a "synthetic title" if:
 - user doesn't ask to hide it with front matter
 - the markdown content does not already contain a top-level h1 heading
*/
function useSyntheticTitle(): string | null {
  const { metadata, frontMatter, contentTitle } = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

function DocMDXContentWithDate({
  children,
  date,
  shouldRenderDateAfterFirstH1,
}: {
  children: ReactNode;
  date: unknown;
  shouldRenderDateAfterFirstH1: boolean;
}): ReactNode {
  let hasRenderedFirstH1Date = false;

  const components = {
    ...MDXComponents,
    h1: (props: ComponentProps<'h1'>) => {
      const shouldRenderDate =
        shouldRenderDateAfterFirstH1 && !hasRenderedFirstH1Date;
      hasRenderedFirstH1Date = true;

      return (
        <>
          <MDXHeading as="h1" {...props} />
          {shouldRenderDate && <ArticleDate date={date} />}
        </>
      );
    },
  };

  return <MDXProvider components={components}>{children}</MDXProvider>;
}

export default function DocItemContent({ children }: Props): ReactNode {
  const syntheticTitle = useSyntheticTitle();
  const { frontMatter } = useDoc();
  const articleDate = (frontMatter as { date?: unknown }).date;

  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {syntheticTitle && (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
          <ArticleDate date={articleDate} />
        </header>
      )}
      <DocMDXContentWithDate
        date={articleDate}
        shouldRenderDateAfterFirstH1={!syntheticTitle}
      >
        {children}
      </DocMDXContentWithDate>
    </div>
  );
}
