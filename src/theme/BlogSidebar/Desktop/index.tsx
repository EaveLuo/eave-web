import { memo } from 'react';
import clsx from 'clsx';
import { translate } from '@docusaurus/Translate';
import {
  BlogSidebarItemList,
  useVisibleBlogSidebarItems,
} from '@docusaurus/plugin-content-blog/client';
import BlogSidebarContent from '@theme/BlogSidebar/Content';
import type { Props as BlogSidebarContentProps } from '@theme/BlogSidebar/Content';
import type { Props } from '@theme/BlogSidebar/Desktop';
import { LibraryBig, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useArticleSidebarState } from '@site/src/theme/BlogLayout/sidebarState';

import styles from './styles.module.css';

const ListComponent: BlogSidebarContentProps['ListComponent'] = ({ items }) => (
  <BlogSidebarItemList
    items={items}
    ulClassName={clsx(styles.sidebarItemList, 'clean-list')}
    liClassName={styles.sidebarItem}
    linkClassName={styles.sidebarItemLink}
    linkActiveClassName={styles.sidebarItemLinkActive}
  />
);

function BlogSidebarDesktop({ sidebar }: Props) {
  const { collapsed, toggleSidebar } = useArticleSidebarState();
  const items = useVisibleBlogSidebarItems(sidebar.items);
  const collapseLabel = translate({
    id: 'article.sidebar.collapse',
    message: 'Collapse article list',
  });
  const expandLabel = translate({
    id: 'article.sidebar.expand',
    message: 'Expand article list',
  });
  const toggleLabel = collapsed ? expandLabel : collapseLabel;

  return (
    <aside
      className={styles.aside}
      data-blog-sidebar-collapsed={collapsed}
    >
      {!collapsed ? (
        <nav
          id='article-sidebar-navigation'
          className={styles.sidebar}
          aria-label={translate({
            id: 'theme.blog.sidebar.navAriaLabel',
            message: 'Blog recent posts navigation',
            description: 'The ARIA label for recent posts in the blog sidebar',
          })}
        >
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>
              <LibraryBig size={17} aria-hidden='true' />
              <span>{sidebar.title}</span>
            </div>
          </div>

          <div className={styles.sidebarContent}>
            <BlogSidebarContent
              items={items}
              ListComponent={ListComponent}
              yearGroupHeadingClassName={styles.yearGroupHeading}
            />
          </div>
        </nav>
      ) : null}

      <button
        type='button'
        className={clsx(
          styles.edgeToggle,
          collapsed ? styles.expandHandle : styles.collapseHandle,
        )}
        aria-label={toggleLabel}
        title={toggleLabel}
        aria-controls='article-sidebar-navigation'
        aria-expanded={!collapsed}
        onClick={toggleSidebar}
      >
        {collapsed ? (
          <PanelLeftOpen size={17} aria-hidden='true' />
        ) : (
          <PanelLeftClose size={17} aria-hidden='true' />
        )}
      </button>
    </aside>
  );
}

export default memo(BlogSidebarDesktop);
