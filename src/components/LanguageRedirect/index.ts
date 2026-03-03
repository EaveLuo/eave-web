/**
 * LanguageRedirect 模块入口
 */

// 从组件文件导入，避免循环引用
export { LanguageRedirect } from './redirect';
export type {
  UserPreference,
  DetectionResult,
  DetectionStatus,
  GeoIPResponse,
} from './types';
export {
  STORAGE_KEYS,
  CONFIG,
} from './types';
export {
  getUserPreference,
  setUserPreference,
  markManualSwitch,
  markAutoRedirected,
  clearUserPreference,
  getCachedGeoResult,
  setCachedGeoResult,
} from './storage';
export {
  detectBrowserLanguage,
  detectByGeoIP,
  detectLanguage,
} from './detector';
