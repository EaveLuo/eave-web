/**
 * 语言检测逻辑
 * 包括浏览器语言检测和 IP 地理位置检测
 */

import {
  type DetectionResult,
  type GeoIPResponse,
  CONFIG,
} from './types';
import {
  getCachedGeoResult,
  setCachedGeoResult,
} from './storage';

/**
 * 标准化语言代码
 */
function normalizeLanguageCode(lang: string): string {
  return lang.toLowerCase().replace(/_/g, '-');
}

/**
 * 检查是否为中文语言
 */
function isChineseLanguage(lang: string): boolean {
  const normalized = normalizeLanguageCode(lang);
  return CONFIG.CHINESE_LOCALES.some(code =>
    normalized.startsWith(normalizeLanguageCode(code))
  );
}

/**
 * 检查是否为英文语言
 */
function isEnglishLanguage(lang: string): boolean {
  const normalized = normalizeLanguageCode(lang);
  return CONFIG.ENGLISH_LOCALES.some(code =>
    normalized.startsWith(normalizeLanguageCode(code))
  );
}

/**
 * 通过浏览器 navigator 检测语言
 * @returns DetectionResult 或 null（SSR 环境）
 */
export function detectBrowserLanguage(): DetectionResult | null {
  // SSR 环境检查
  if (typeof navigator === 'undefined') return null;

  // 获取浏览器语言
  const rawLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage;

  if (!rawLang) return null;

  const lang = normalizeLanguageCode(rawLang);

  // 中文环境 -> 不跳转
  if (isChineseLanguage(lang)) {
    return {
      shouldRedirect: false,
      targetLocale: 'zh-CN',
      source: 'browser',
      confidence: 0.9,
    };
  }

  // 英文环境 -> 跳转英文
  if (isEnglishLanguage(lang)) {
    return {
      shouldRedirect: true,
      targetLocale: 'en',
      source: 'browser',
      confidence: 0.9,
    };
  }

  // 其他语言（日文、韩文等）-> 默认跳转英文
  // 因为网站只支持中英，非中文环境优先英文
  return {
    shouldRedirect: true,
    targetLocale: 'en',
    source: 'browser',
    confidence: 0.6,
  };
}

/**
 * 通过 GeoIP 检测地理位置
 * 备选方案：当浏览器检测无法确定时使用
 */
export async function detectByGeoIP(): Promise<DetectionResult | null> {
  // SSR 环境检查
  if (typeof window === 'undefined') return null;

  // 检查缓存
  const cached = getCachedGeoResult();
  if (cached) {
    return {
      shouldRedirect: !cached.isChina,
      targetLocale: cached.isChina ? 'zh-CN' : 'en',
      source: 'geoip',
      confidence: 0.7,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.GEOIP_TIMEOUT);

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GeoIP API error: ${response.status}`);
    }

    const data: GeoIPResponse = await response.json();
    const isChina = data.country_code === 'CN';

    // 缓存结果
    setCachedGeoResult({
      isChina,
      countryCode: data.country_code,
    });

    return {
      shouldRedirect: !isChina,
      targetLocale: isChina ? 'zh-CN' : 'en',
      source: 'geoip',
      confidence: 0.7,
    };
  } catch (error) {
    // API 调用失败，返回 null 表示检测失败
    console.warn('[LanguageRedirect] GeoIP detection failed:', error);
    return null;
  }
}

/**
 * 综合检测
 * 优先使用浏览器语言，浏览器检测失败后才使用 GeoIP
 */
export async function detectLanguage(): Promise<DetectionResult | null> {
  // 首先尝试浏览器检测
  const browserResult = detectBrowserLanguage();

  // 浏览器检测成功，直接使用结果（无论 confidence）
  if (browserResult) {
    return browserResult;
  }

  // 浏览器检测失败，才尝试 GeoIP 作为备用
  const geoResult = await detectByGeoIP();

  return geoResult;
}
