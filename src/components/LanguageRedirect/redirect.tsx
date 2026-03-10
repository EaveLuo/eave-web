/**
 * 语言自动重定向组件 - 底部浮层提示模式
 * 异步检测用户语言，展示底部浮层提示切换
 * 支持双向切换：中文站提示切换到英文，英文站提示切换到中文
 */

import React, { useEffect, useState, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';

import {
  type DetectionResult,
} from './types';
import {
  getUserPreference,
  markManualSwitch,
  markAutoRedirected,
} from './storage';
import { detectLanguage } from './detector';

import styles from './styles.module.css';

/**
 * 检查当前语言环境
 */
function getCurrentLocale(pathname: string): 'zh-CN' | 'en' {
  return pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'zh-CN';
}

/**
 * 计算重定向目标 URL
 */
function calculateTargetUrl(
  currentPath: string,
  targetLocale: 'zh-CN' | 'en',
  baseUrl: string
): string {
  const currentLocale = getCurrentLocale(currentPath);

  if (targetLocale === 'en') {
    // 切换到英文：当前路径添加 /en 前缀
    if (currentLocale === 'en') {
      return `${baseUrl}${currentPath}`;
    }
    return `${baseUrl}/en${currentPath}`;
  } else {
    // 切换到中文：移除 /en 前缀
    if (currentLocale === 'en') {
      return `${baseUrl}${currentPath.replace(/^\/en/, '')}` || `${baseUrl}/`;
    }
    return `${baseUrl}${currentPath}`;
  }
}

/**
 * 语言切换提示浮层组件
 */
interface LanguagePromptProps {
  targetLocale: 'zh-CN' | 'en';
  onConfirm: () => void;
  onDismiss: () => void;
}

function LanguagePrompt({ targetLocale, onConfirm, onDismiss }: LanguagePromptProps): React.JSX.Element {
  // 自动隐藏计时器
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 30000); // 30 秒后自动隐藏

    return () => clearTimeout(timer);
  }, [onDismiss]);

  // 根据目标语言确定提示文本
  const promptMessage = targetLocale === 'en'
    ? translate({ id: 'languagePrompt.switchToEn', message: 'Switch to English?' })
    : translate({ id: 'languagePrompt.switchToZh', message: '切换到中文？' });

  return (
    <div className={styles.promptContainer}>
      <div className={styles.promptContent}>
        <div className={styles.promptText}>
          {promptMessage}
        </div>
        <div className={styles.promptActions}>
          <button
            type="button"
            className={clsx(styles.button, styles.buttonSecondary)}
            onClick={onDismiss}
          >
            {translate({
              id: 'languagePrompt.stay',
              message: 'Stay',
            })}
          </button>
          <button
            type="button"
            className={clsx(styles.button, styles.buttonPrimary)}
            onClick={onConfirm}
          >
            {translate({
              id: 'languagePrompt.switch',
              message: 'Switch',
            })}
          </button>
        </div>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onDismiss}
        aria-label={translate({
          id: 'languagePrompt.close',
          message: 'Close',
        })}
      >
        ×
      </button>
    </div>
  );
}

/**
 * 语言检测与提示组件
 */
export function LanguageRedirect(): React.JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();

  const [showPrompt, setShowPrompt] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  // 检测语言并决定是否显示提示
  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) return;

    const pathname = window.location.pathname;
    const currentLocale = getCurrentLocale(pathname);

    // 已提示过或手动切换过，不再提示（24小时内有效）
    const preference = getUserPreference();
    if (preference?.redirected) return;

    // DOM 就绪后执行检测
    const detect = () => {
      void (async () => {
        const result = await detectLanguage();

        if (!result) return;

        // 判断是否需要提示切换
        // 当前中文站 + 检测到英文环境 -> 提示切换英文
        // 当前英文站 + 检测到中文环境 -> 提示切换中文
        const shouldPrompt =
          (currentLocale === 'zh-CN' && result.shouldRedirect && result.targetLocale === 'en') ||
          (currentLocale === 'en' && !result.shouldRedirect);

        if (shouldPrompt) {
          setDetectionResult(result);
          setShowPrompt(true);
        }
      })();
    };

    // 检查 DOM 是否已就绪
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // DOM 已就绪，直接执行
      detect();
    } else {
      // 等待 DOMContentLoaded
      window.addEventListener('DOMContentLoaded', detect);
      return () => window.removeEventListener('DOMContentLoaded', detect);
    }
  }, []);

  // 确认切换语言
  const handleConfirm = useCallback(() => {
    if (!detectionResult) return;

    const pathname = window.location.pathname;
    const currentLocale = getCurrentLocale(pathname);

    // 根据当前环境和检测结果确定目标语言
    const targetLocale = currentLocale === 'zh-CN' ? 'en' : 'zh-CN';

    const targetUrl = calculateTargetUrl(
      pathname,
      targetLocale,
      siteConfig.url
    );

    // 标记为手动切换，当天不再提示
    markManualSwitch(targetLocale);

    // 跳转
    window.location.href = targetUrl;
  }, [detectionResult, siteConfig.url]);

  // 关闭提示
  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    // 标记为已提示过，当天不再提示
    if (detectionResult) {
      const pathname = window.location.pathname;
      const currentLocale = getCurrentLocale(pathname);
      const targetLocale = currentLocale === 'zh-CN' ? 'en' : 'zh-CN';
      markAutoRedirected(targetLocale);
    }
  }, [detectionResult]);

  if (!showPrompt || !detectionResult) {
    return null;
  }

  const pathname = window.location.pathname;
  const targetLocale = getCurrentLocale(pathname) === 'zh-CN' ? 'en' : 'zh-CN';

  return (
    <div className={styles.promptWrapper}>
      <LanguagePrompt
        targetLocale={targetLocale}
        onConfirm={handleConfirm}
        onDismiss={handleDismiss}
      />
    </div>
  );
}

// 包装组件，仅在浏览器端渲染
function LanguageRedirectWrapper(): React.JSX.Element | null {
  return (
    <BrowserOnly fallback={null}>
      {() => <LanguageRedirect />}
    </BrowserOnly>
  );
}

export default LanguageRedirectWrapper;
