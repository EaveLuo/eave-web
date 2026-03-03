/**
 * 语言自动重定向模块类型定义
 */

/**
 * 用户语言偏好设置
 */
export interface UserPreference {
  /** 是否已经触发过重定向 */
  redirected: boolean;
  /** 用户偏好的语言区域 */
  preferredLocale: 'zh-CN' | 'en';
  /** 设置时间戳 */
  timestamp: number;
  /** 来源：浏览器检测 / IP地理 / 手动切换 */
  source: 'browser' | 'geoip' | 'manual';
}

/**
 * 语言检测结果
 */
export interface DetectionResult {
  /** 是否应该重定向 */
  shouldRedirect: boolean;
  /** 目标语言区域 */
  targetLocale: 'zh-CN' | 'en';
  /** 检测来源 */
  source: 'browser' | 'geoip';
  /** 检测置信度 0-1 */
  confidence: number;
}

/**
 * GeoIP API 响应结构
 */
export interface GeoIPResponse {
  /** 国家代码，如 CN, US */
  country_code: string;
  /** 国家名称 */
  country_name: string;
}

/**
 * 存储 key 常量
 */
export const STORAGE_KEYS = {
  /** 用户语言偏好 */
  USER_PREFERENCE: 'eave-language-preference',
  /** GeoIP 检测结果缓存 */
  GEO_CACHE: 'eave-geo-cache',
} as const;

/**
 * 配置常量
 */
export const CONFIG = {
  /** GeoIP 检测超时时间（毫秒） */
  GEOIP_TIMEOUT: 3000,
  /** 偏好设置有效期（毫秒）：当天有效（24小时） */
  PREFERENCE_TTL: 24 * 60 * 60 * 1000,
  /** 中文语言代码列表 */
  CHINESE_LOCALES: ['zh', 'zh-CN', 'zh-TW', 'zh-HK', 'zh-SG', 'cmn-Hans', 'cmn-Hant'],
  /** 英文语言代码列表 */
  ENGLISH_LOCALES: ['en', 'en-US', 'en-GB', 'en-CA', 'en-AU', 'en-NZ'],
} as const;

/**
 * 检测状态
 */
export type DetectionStatus =
  | { type: 'idle' }
  | { type: 'detecting'; source: 'browser' | 'geoip' }
  | { type: 'detected'; result: DetectionResult }
  | { type: 'error'; error: Error }
  | { type: 'skipped'; reason: 'already_redirected' | 'manual_switch' | 'on_english_site' };
