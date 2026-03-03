/**
 * LocalStorage 封装工具
 * 处理 SSR 兼容性和 localStorage 不可用的情况
 */

import {
  type UserPreference,
  STORAGE_KEYS,
  CONFIG,
} from './types';

/**
 * 检查是否在浏览器环境
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * 获取用户语言偏好
 * @returns 用户偏好设置，如果不存在或过期则返回 null
 */
export function getUserPreference(): UserPreference | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCE);
    if (!raw) return null;

    const preference = JSON.parse(raw) as UserPreference;

    // 检查是否过期
    const age = Date.now() - preference.timestamp;
    if (age > CONFIG.PREFERENCE_TTL) {
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCE);
      return null;
    }

    return preference;
  } catch {
    // localStorage 被禁用或解析错误
    return null;
  }
}

/**
 * 设置用户语言偏好
 */
export function setUserPreference(preference: Omit<UserPreference, 'timestamp'>): void {
  if (!isBrowser()) return;

  try {
    const data: UserPreference = {
      ...preference,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCE, JSON.stringify(data));
  } catch {
    // 忽略 localStorage 写入失败
  }
}

/**
 * 标记用户已手动切换语言
 * 疲劳度：当天（24小时）内不再提示
 */
export function markManualSwitch(locale: 'zh-CN' | 'en'): void {
  setUserPreference({
    redirected: true,
    preferredLocale: locale,
    source: 'manual',
  });
}

/**
 * 标记已自动重定向过
 */
export function markAutoRedirected(locale: 'zh-CN' | 'en'): void {
  setUserPreference({
    redirected: true,
    preferredLocale: locale,
    source: 'browser',
  });
}

/**
 * 清除用户偏好（用于调试）
 */
export function clearUserPreference(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCE);
    localStorage.removeItem(STORAGE_KEYS.GEO_CACHE);
  } catch {
    // 忽略错误
  }
}

/**
 * GeoIP 缓存结构
 */
interface GeoCache {
  result: { isChina: boolean; countryCode: string };
  timestamp: number;
}

/** GeoIP 缓存有效期：1 小时 */
const GEO_CACHE_TTL = 60 * 60 * 1000;

/**
 * 获取缓存的 GeoIP 结果
 */
export function getCachedGeoResult(): { isChina: boolean; countryCode: string } | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GEO_CACHE);
    if (!raw) return null;

    const cache = JSON.parse(raw) as GeoCache;

    // 检查是否过期
    const age = Date.now() - cache.timestamp;
    if (age > GEO_CACHE_TTL) {
      localStorage.removeItem(STORAGE_KEYS.GEO_CACHE);
      return null;
    }

    return cache.result;
  } catch {
    return null;
  }
}

/**
 * 缓存 GeoIP 结果
 */
export function setCachedGeoResult(result: { isChina: boolean; countryCode: string }): void {
  if (!isBrowser()) return;

  try {
    const cache: GeoCache = {
      result,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.GEO_CACHE, JSON.stringify(cache));
  } catch {
    // 忽略错误
  }
}

