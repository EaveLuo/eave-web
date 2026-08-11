import React, {
  useCallback,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { translate } from '@docusaurus/Translate';
import { ThemeClassNames, useThemeConfig } from '@docusaurus/theme-common';
import {
  useLocationChange,
  useNavbarMobileSidebar,
  useScrollPosition,
} from '@docusaurus/theme-common/internal';
import NavbarMobileSidebar from '@theme/Navbar/MobileSidebar';
import type { Props } from '@theme/Navbar/Layout';

import styles from './styles.module.css';

function getHashAnchor(hash: string): HTMLElement | null {
  const hashId = hash.startsWith('#') ? hash.slice(1) : hash;

  try {
    return (
      document.getElementById(decodeURIComponent(hashId)) ??
      document.getElementById(hashId)
    );
  } catch {
    return document.getElementById(hashId);
  }
}

function useDecodedHashHideableNavbar(hideOnScroll: boolean) {
  const [isNavbarVisible, setIsNavbarVisible] = useState(hideOnScroll);
  const isFocusedAnchor = useRef(false);
  const navbarHeight = useRef(0);
  const navbarRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      navbarHeight.current = node.getBoundingClientRect().height;
    }
  }, []);

  useScrollPosition(({ scrollY: scrollTop }, lastPosition) => {
    if (!hideOnScroll) {
      return;
    }

    if (scrollTop < navbarHeight.current) {
      setIsNavbarVisible(true);
      return;
    }

    if (isFocusedAnchor.current) {
      isFocusedAnchor.current = false;
      return;
    }

    const lastScrollTop = lastPosition?.scrollY;
    const documentHeight =
      document.documentElement.scrollHeight - navbarHeight.current;
    const windowHeight = window.innerHeight;

    if (lastScrollTop && scrollTop >= lastScrollTop) {
      setIsNavbarVisible(false);
    } else if (scrollTop + windowHeight < documentHeight) {
      setIsNavbarVisible(true);
    }
  });

  useLocationChange(({ location }) => {
    if (!hideOnScroll) {
      return;
    }

    if (location.hash && getHashAnchor(location.hash)) {
      isFocusedAnchor.current = true;
      setIsNavbarVisible(false);
      return;
    }

    setIsNavbarVisible(true);
  });

  return { navbarRef, isNavbarVisible };
}

function NavbarBackdrop(props: ComponentProps<'div'>) {
  return (
    <div
      role="presentation"
      {...props}
      className={clsx('navbar-sidebar__backdrop', props.className)}
    />
  );
}

export default function NavbarLayout({ children }: Props): ReactNode {
  const {
    navbar: { hideOnScroll, style },
  } = useThemeConfig();
  const mobileSidebar = useNavbarMobileSidebar();
  const { navbarRef, isNavbarVisible } =
    useDecodedHashHideableNavbar(hideOnScroll);

  return (
    <nav
      ref={navbarRef}
      aria-label={translate({
        id: 'theme.NavBar.navAriaLabel',
        message: 'Main',
        description: 'The ARIA label for the main navigation',
      })}
      className={clsx(
        ThemeClassNames.layout.navbar.container,
        'navbar',
        'navbar--fixed-top',
        hideOnScroll && [
          styles.navbarHideable,
          !isNavbarVisible && styles.navbarHidden,
        ],
        {
          'navbar--dark': style === 'dark',
          'navbar--primary': style === 'primary',
          'navbar-sidebar--show': mobileSidebar.shown,
        },
      )}
    >
      {children}
      <NavbarBackdrop onClick={mobileSidebar.toggle} />
      <NavbarMobileSidebar />
    </nav>
  );
}
