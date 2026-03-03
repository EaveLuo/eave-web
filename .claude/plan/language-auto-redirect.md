# 智能语言检测功能 - 项目总结

## 功能概述

为 Docusaurus 国际化站点实现智能语言检测系统，根据用户系统语言自动提示切换，提升非中文用户的访问体验。

## 已实现特性

### 核心功能
- ✅ 浏览器语言检测 (`navigator.language`)
- ✅ IP 地理位置检测 (ipapi.co) - **仅作为浏览器检测失败后的备用**
- ✅ 双向切换提示（中文/英文互切）
- ✅ 底部浮层提示 UI
- ✅ 24 小时疲劳度控制
- ✅ PC/移动端全平台支持

### 技术实现
- ✅ TypeScript 类型安全
- ✅ localStorage 状态持久化
- ✅ SSR 兼容性处理
- ✅ 国际化文案支持
- ✅ 深浅色模式适配
- ✅ Swizzle 自定义语言切换组件
- ✅ **DOMContentLoaded 触发检测**（替代固定延迟）

## 组件架构

```
src/components/LanguageRedirect/
├── types.ts           # 类型定义与配置 (STORAGE_KEYS, CONFIG)
├── storage.ts         # localStorage 封装 (getUserPreference, markManualSwitch...)
├── detector.ts        # 检测逻辑 (detectBrowserLanguage, detectByGeoIP)
├── redirect.tsx       # 主组件 + 浮层 UI + DOMContentLoaded 触发
├── styles.module.css  # 毛玻璃效果样式
└── index.ts           # 模块导出

src/theme/NavbarItem/LocaleDropdownNavbarItem/
├── index.tsx          # Swizzled PC 端语言切换
└── styles.module.css  # 样式
```

## 检测策略（更新）

### 优先级顺序
1. **浏览器检测** (`navigator.language` / `navigator.userLanguage`)
   - 中文语言码 → 不提示
   - 英文语言码 → 提示切换英文
   - 其他语言 → 提示切换英文（confidence 0.6 但直接使用）
   - **只要浏览器检测返回结果，就直接使用，不调用 IP API**

2. **备用检测** - IP 地理位置 API
   - **仅当浏览器检测返回 null 时才调用**
   - 3 秒超时保护

### 触发时机
- **DOMContentLoaded** 事件触发检测
- 替代原有的固定 2 秒延迟
- 检测时机更早，响应更快

### 决策逻辑
- 中文站 + 非中文环境 → 提示切换英文
- 英文站 + 中文环境 → 提示切换中文

### 性能优化
| 用户类型 | 网络请求 | 说明 |
|---------|---------|------|
| 中文用户 | 0 | 浏览器检测即确定 |
| 英文用户 | 0 | 浏览器检测即确定 |
| 其他语言用户 | 0 | 浏览器检测返回结果直接使用 |
| 浏览器检测失败 | 1 | 极少数情况调用 ipapi.co |

## 疲劳度机制

- 触发条件: 点击 Switch / Stay / 关闭 / 手动切换语言
- 有效期: 24 小时 (PREFERENCE_TTL)
- 存储: localStorage (`eave-language-preference`)
- 每天自动重置，重新检测

## Swizzle 组件

**原因**: Docusaurus 原生的 `LocaleDropdownNavbarItem` 无法追踪语言切换事件

**实现**: 在 `items.map()` 中为每个语言项添加 `onClick` 处理器，调用 `markManualSwitch()`

**覆盖场景**:
- ✅ PC 端：顶部导航栏语言下拉
- ✅ 移动端：自定义 MobileLocaleSwitcher

## 国际化配置

**中文文案** (`i18n/zh-CN/code.json`):
- `languagePrompt.switchToEn`: "切换到 English？"
- `languagePrompt.switchToZh`: "切换到中文？"
- `languagePrompt.stay`: "保持现状"
- `languagePrompt.switch`: "切换"
- `languagePrompt.close`: "关闭"

**英文文案** (`i18n/en/code.json`):
- `languagePrompt.switchToEn`: "Switch to English?"
- `languagePrompt.switchToZh`: "Switch to Chinese?"
- `languagePrompt.stay`: "Stay"
- `languagePrompt.switch`: "Switch"
- `languagePrompt.close`: "Close"

## 版本信息

- 版本号: 0.7.0
- 发布日期: 2026-03-03
- 博客文档 (中文): `blog/website/0.7.0.md`

## 后续优化方向

1. 支持更多语言检测 (日语、韩语等)
2. 智能长期偏好记忆（超过 24 小时）
3. 视觉动效优化
4. ~~IP 检测懒加载~~ ✓ 已实现（浏览器优先策略）

## 参考资源

- maplezz.com Liquid Glass 实现原理
- liquid-glass-react 开源项目
- Docusaurus i18n 官方文档
