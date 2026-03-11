import React from 'react';
import clsx from 'clsx';
import NavbarLayout from '@theme/Navbar/Layout';
import NavbarLogo from '@theme/Navbar/Logo';
import NavbarItem from '@theme/NavbarItem';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import NavbarSearch from '@theme/Navbar/Search';
import {
  useThemeConfig,
  ErrorCauseBoundary,
} from '@docusaurus/theme-common';
import {
  splitNavbarItems,
} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

type NavbarItemConfig = {
  type?: string;
  position?: 'left' | 'right';
  [key: string]: unknown;
};

function useNavbarItems() {
  return useThemeConfig().navbar.items as unknown as NavbarItemConfig[];
}

function NavbarItems({ items }: { items: unknown[] }) {
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
              { cause: error },
            )
          }
        >
          <NavbarItem {...(item as Record<string, unknown>)} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

// PC 端组件 - 完全沿用 Docusaurus 原生结构
function DesktopContent() {
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(
    items as { position?: 'left' | 'right' }[],
  );
  const searchBarItem = items.find((item) => item.type === 'search');

  return (
    <div className="navbar__inner">
      <div className="navbar__items">
        <NavbarLogo />
        <NavbarItems items={leftItems} />
      </div>
      <div className="navbar__items navbar__items--right">
        <NavbarItems items={rightItems} />
        <NavbarColorModeToggle />
        {!searchBarItem && (
          <NavbarSearch>
            <SearchBar />
          </NavbarSearch>
        )}
      </div>
    </div>
  );
}

// Mobile 端组件
function MobileContent() {
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(
    items as { position?: 'left' | 'right' }[],
  );

  return (
    <div className={clsx('navbar__inner', styles.mobileInner)}>
      <div className={clsx('navbar__items', styles.mobileLeft)}>
        <NavbarMobileSidebarToggle />
        <NavbarLogo />
        <NavbarItems items={leftItems} />
      </div>
      <div className={clsx('navbar__items navbar__items--right', styles.mobileRight)}>
        <NavbarItems items={rightItems} />
        <NavbarColorModeToggle className={styles.mobileThemeToggle} />
        <NavbarSearch className={styles.mobileSearch}>
          <SearchBar />
        </NavbarSearch>
      </div>
    </div>
  );
}

export default function Navbar(): React.ReactElement {
  return (
    <NavbarLayout>
      {/* PC端 (>996px) */}
      <div className={styles.desktopOnly}>
        <DesktopContent />
      </div>
      {/* Mobile端 (<=996px) */}
      <div className={styles.mobileOnly}>
        <MobileContent />
      </div>
    </NavbarLayout>
  );
}
