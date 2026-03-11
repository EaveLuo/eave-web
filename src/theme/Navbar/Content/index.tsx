import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {
  useThemeConfig,
  ErrorCauseBoundary,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import NavbarItem, {type Props as NavbarItemConfig} from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarSearch from '@theme/Navbar/Search';
import FloatingActions from '@site/src/components/FloatingActions';

import styles from './styles.module.css';

function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items as NavbarItemConfig[];
}

function NavbarItems({items}: {items: NavbarItemConfig[]}): ReactNode {
  return (
    <>
      {items.map((item, i) => (
        <ErrorCauseBoundary
          key={i}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
              {cause: error},
            )
          }>
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

function NavbarContentLayout({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="navbar__inner">
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerLeft,
          'navbar__items',
        )}>
        {left}
      </div>
      <div
        className={clsx(
          ThemeClassNames.layout.navbar.containerRight,
          'navbar__items navbar__items--right',
        )}>
        {right}
      </div>
    </div>
  );
}

// PC 端组件
function DesktopContent() {
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const searchBarItem = items.find((item) => item.type === 'search');

  return (
    <NavbarContentLayout
      left={
        <>
          <NavbarLogo />
          <NavbarItems items={leftItems} />
        </>
      }
      right={
        <>
          <NavbarItems items={rightItems} />
          <NavbarColorModeToggle className={styles.colorModeToggle} />
          {!searchBarItem && (
            <NavbarSearch>
              <SearchBar />
            </NavbarSearch>
          )}
        </>
      }
    />
  );
}

// 移动端组件 - 直接显示栏目链接
function MobileContent() {
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);

  // 过滤掉 localeDropdown 和 search 类型，这些放到悬浮按钮
  const navItems = [...leftItems, ...rightItems].filter(
    (item) => item.type !== 'localeDropdown' && item.type !== 'search'
  );

  return (
    <>
      <div className={clsx('navbar__inner', styles.mobileInner)}>
        <div className={clsx('navbar__items', styles.mobileLeft)}>
          <NavbarLogo />
        </div>
        <div className={clsx('navbar__items navbar__items--right', styles.mobileRight)}>
          {/* 移动端直接显示栏目链接 */}
          <div className={styles.mobileNavItems}>
            <NavbarItems items={navItems} />
          </div>
        </div>
      </div>
      {/* 移动端悬浮按钮 */}
      <FloatingActions />
    </>
  );
}

export default function NavbarContent(): ReactNode {
  return (
    <>
      {/* PC 端显示 */}
      <div className={styles.desktopOnly}>
        <DesktopContent />
      </div>
      {/* 移动端显示 */}
      <div className={styles.mobileOnly}>
        <MobileContent />
      </div>
    </>
  );
}
