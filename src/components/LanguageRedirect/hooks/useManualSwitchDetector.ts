/**
 * 检测用户手动语言切换
 * 监听 Docusaurus 语言切换事件
 */

import { useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { markManualSwitch } from '../storage';

/**
 * Hook: 监听语言切换
 * 当当前 locale 与 localStorage 记录不一致时，标记为手动切换
 */
export function useManualSwitchDetector(): void {
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) return;

    // 页面加载时，检查是否需要标记手动切换
    // 只在 locale 发生变化时执行
    const searchParams = new URLSearchParams(window.location.search);
    const localeParam = searchParams.get('locale');

    // 如果有 locale 参数，说明用户可能通过 URL 切换
    if (localeParam) {
      markManualSwitch(currentLocale as 'zh-CN' | 'en');
    }
  }, [currentLocale]);
}

export default useManualSwitchDetector;
