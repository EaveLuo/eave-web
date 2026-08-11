import type { ReactNode } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import BlogSidebar from '@theme/BlogSidebar';
import type { Props } from '@theme/BlogLayout';

import {
  ArticleSidebarStateProvider,
  useArticleSidebarState,
} from './sidebarState';
import styles from './styles.module.css';

type ReadingWorkspaceProps = Pick<Props, 'sidebar' | 'toc' | 'children'>;

function ReadingWorkspace({
  sidebar,
  toc,
  children,
}: ReadingWorkspaceProps): ReactNode {
  const hasSidebar = Boolean(sidebar?.items.length);
  const hasToc = Boolean(toc);
  const { collapsed } = useArticleSidebarState();

  return (
    <div className={styles.readingPage}>
      <div
        className={clsx(styles.readingGrid, {
          [styles.sidebarCollapsed]: hasSidebar && collapsed,
          [styles.withoutSidebar]: !hasSidebar,
          [styles.withoutToc]: !hasToc,
        })}
      >
        {hasSidebar ? (
          <div className={styles.sidebarSlot}>
            <BlogSidebar sidebar={sidebar} />
          </div>
        ) : null}

        <main className={styles.articleColumn}>{children}</main>

        {hasToc ? <aside className={styles.tocSlot}>{toc}</aside> : null}
      </div>
    </div>
  );
}

export default function BlogLayout({
  sidebar,
  toc,
  children,
  ...layoutProps
}: Props): ReactNode {
  return (
    <Layout {...layoutProps}>
      <ArticleSidebarStateProvider>
        <ReadingWorkspace sidebar={sidebar} toc={toc}>
          {children}
        </ReadingWorkspace>
      </ArticleSidebarStateProvider>
    </Layout>
  );
}
