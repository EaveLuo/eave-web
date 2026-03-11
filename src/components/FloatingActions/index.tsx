import React, {useState, useEffect, type ReactNode} from 'react';
import clsx from 'clsx';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useAlternatePageUtils} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import SearchBar from '@theme/SearchBar';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import {markManualSwitch} from '@site/src/components/LanguageRedirect';
import styles from './styles.module.css';

// 搜索图标
function SearchIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// 语言图标
function GlobeIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// 主题图标
function ThemeIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

// 语言切换菜单
function LocaleMenu({onClose}: {onClose: () => void}) {
  const {
    siteConfig,
    i18n: {currentLocale, locales, localeConfigs},
  } = useDocusaurusContext();
  const alternatePageUtils = useAlternatePageUtils();
  const location = useLocation();

  const handleLocaleClick = (locale: string) => {
    if (locale !== currentLocale) {
      markManualSwitch(locale as 'zh-CN' | 'en');
    }
  };

  const getLocaleUrl = (locale: string) => {
    const localeConfig = localeConfigs[locale] as {url?: string};
    const isSameDomain =
      !localeConfig?.url || localeConfig.url === siteConfig.url;

    if (isSameDomain) {
      return alternatePageUtils.createUrl({
        locale,
        fullyQualified: false,
      });
    }
    return alternatePageUtils.createUrl({
      locale,
      fullyQualified: true,
    });
  };

  return (
    <div className={styles.localeMenu}>
      <div className={styles.localeMenuHeader}>
        {translate({
          id: 'theme.navbar.mobileLocaleSwitcher.title',
          message: '选择语言',
        })}
      </div>
      {locales.map((locale) => (
        <Link
          key={locale}
          to={getLocaleUrl(locale)}
          className={clsx(
            styles.localeMenuItem,
            locale === currentLocale && styles.localeMenuItemActive,
          )}
          onClick={() => {
            handleLocaleClick(locale);
            onClose();
          }}>
          <span>{(localeConfigs[locale] as {label: string}).label}</span>
          {locale === currentLocale && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </Link>
      ))}
    </div>
  );
}

// 搜索弹窗
function SearchModal({onClose}: {onClose: () => void}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className={styles.searchModal} onClick={onClose}>
      <div className={styles.searchModalContent} onClick={(e) => e.stopPropagation()}>
        <SearchBar />
      </div>
    </div>
  );
}

export default function FloatingActions(): ReactNode {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showLocale, setShowLocale] = useState(false);

  // 点击外部关闭菜单
  useEffect(() => {
    if (!isExpanded) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.container}`)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isExpanded]);

  return (
    <>
      {/* 搜索弹窗 */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      {/* 语言菜单 */}
      {showLocale && <LocaleMenu onClose={() => setShowLocale(false)} />}

      {/* 悬浮按钮组 */}
      <div className={styles.container}>
        {/* 展开的功能按钮 */}
        <div className={clsx(styles.buttonsContainer, isExpanded && styles.buttonsContainerExpanded)}>
          {/* 搜索按钮 */}
          <button
            className={clsx(styles.button, styles.buttonSearch)}
            onClick={() => {
              setIsExpanded(false);
              setShowSearch(true);
            }}
            aria-label={translate({
              id: 'theme.SearchBar.label',
              message: '搜索',
            })}>
            <SearchIcon />
          </button>

          {/* 主题切换按钮 */}
          <div className={clsx(styles.button, styles.buttonTheme)}>
            <NavbarColorModeToggle />
          </div>

          {/* 语言切换按钮 */}
          <button
            className={clsx(styles.button, styles.buttonLocale)}
            onClick={() => {
              setIsExpanded(false);
              setShowLocale(true);
            }}
            aria-label={translate({
              id: 'theme.navbar.mobileLocaleSwitcher.buttonAriaLabel',
              message: '切换语言',
            })}>
            <GlobeIcon />
          </button>
        </div>

        {/* 主按钮 */}
        <button
          className={clsx(styles.mainButton, isExpanded && styles.mainButtonActive)}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={translate({
            id: 'floatingActions.toggle',
            message: '打开功能菜单',
          })}>
          <svg
            className={clsx(styles.mainButtonIcon, isExpanded && styles.mainButtonIconRotated)}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </>
  );
}
