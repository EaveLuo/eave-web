import React, { useState, useRef, useEffect, memo } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAlternatePageUtils } from '@docusaurus/theme-common/internal';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import { markManualSwitch } from '@site/src/components/LanguageRedirect';
import styles from './styles.module.css';

interface MobileLocaleSwitcherProps {
  className?: string;
}

interface LocaleConfig {
  label: string;
  htmlLang: string;
  direction: string;
}

function useLocaleSwitcherUtils() {
  const {
    siteConfig,
    i18n: { localeConfigs },
  } = useDocusaurusContext();
  const alternatePageUtils = useAlternatePageUtils();
  const location = useLocation();

  // SSR 时 location 为 undefined，使用空值
  const search = location?.search ?? '';
  const hash = location?.hash ?? '';

  const getLocaleConfig = (locale: string): LocaleConfig => {
    const config = localeConfigs[locale] as LocaleConfig | undefined;
    if (!config) {
      throw new Error(
        `Docusaurus bug, no locale config found for locale=${locale}`,
      );
    }
    return config;
  };

  const getBaseURLForLocale = (locale: string) => {
    const localeConfig = getLocaleConfig(locale);
    // @ts-expect-error: localeConfigs may have url property from i18n config
    const localeConfigUrl = localeConfig.url as string | undefined;
    const isSameDomain = localeConfigUrl === undefined || localeConfigUrl === siteConfig.url;

    if (isSameDomain) {
      return `pathname://${alternatePageUtils.createUrl({
        locale,
        fullyQualified: false,
      })}`;
    }
    return alternatePageUtils.createUrl({
      locale,
      fullyQualified: true,
    });
  };

  // 简单的 query string 合并，替代 mergeSearchStrings
  const mergeSearch = (baseSearch: string, additional?: string): string => {
    if (!additional) return baseSearch;
    if (!baseSearch) return additional;
    const base = baseSearch.startsWith('?') ? baseSearch.slice(1) : baseSearch;
    const add = additional.startsWith('?') ? additional.slice(1) : additional;
    return `?${base}&${add}`;
  };

  return {
    getURL: (locale: string, queryString?: string) => {
      const finalSearch = mergeSearch(search, queryString);
      const baseUrl = getBaseURLForLocale(locale);
      // 保留 pathname:// 前缀，与 Docusaurus 内置 LocaleDropdown 行为一致
      return `${baseUrl}${finalSearch}${hash}`;
    },
    getLabel: (locale: string) => getLocaleConfig(locale).label,
    getLang: (locale: string) => getLocaleConfig(locale).htmlLang,
    localeConfigs,
  };
}

// 语言图标 (Globe)
function GlobeIcon({ className }: { className?: string }) {
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
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// 向下箭头图标
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// 勾选图标
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MobileLocaleSwitcher({ className }: MobileLocaleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const utils = useLocaleSwitcherUtils();
  const {
    i18n: { currentLocale, locales },
  } = useDocusaurusContext();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const localeItems = locales.map((locale) => ({
    locale,
    label: utils.getLabel(locale),
    lang: utils.getLang(locale),
    to: utils.getURL(locale),
    isActive: locale === currentLocale,
    target: '_self' as const,
    autoAddBaseUrl: false,
  }));

  // 获取当前语言标签
  const currentLabel = utils.getLabel(currentLocale);

  return (
    <div ref={containerRef} className={clsx(styles.container, className)}>
      <button
        type="button"
        className={styles.button}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={translate({
          id: 'theme.navbar.mobileLocaleSwitcher.buttonAriaLabel',
          message: '切换语言',
          description: '移动端语言切换按钮的 ARIA 标签',
        })}
      >
        <GlobeIcon className={styles.icon} />
        <span className={styles.label}>{currentLabel}</span>
        <ChevronDownIcon
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownHeader}>
            <Translate
              id="theme.navbar.mobileLocaleSwitcher.title"
              description="移动端语言切换菜单标题"
            >
              选择语言
            </Translate>
          </div>
          <ul className={styles.dropdownList}>
            {localeItems.map((item) => (
              <li key={item.locale} className={styles.dropdownItem}>
                <Link
                  to={item.to}
                  target={item.target}
                  autoAddBaseUrl={item.autoAddBaseUrl}
                  className={`${styles.dropdownLink} ${
                    item.isActive ? styles.dropdownLinkActive : ''
                  }`}
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    // 标记用户手动切换语言，禁用自动重定向
                    if (!item.isActive) {
                      markManualSwitch(item.locale as 'zh-CN' | 'en');
                    }
                  }}
                >
                  <span className={styles.localeLabel}>{item.label}</span>
                  {item.isActive && (
                    <CheckIcon className={styles.checkIcon} />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default memo(MobileLocaleSwitcher);
