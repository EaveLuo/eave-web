# eave-web 项目知识沉淀

本文档沉淀了 eave-web 项目开发过程中的核心经验和最佳实践。

---

## 📚 目录

1. [Git 工作流规范](#1-git-工作流规范)
2. [Docusaurus 国际化方案](#2-docusaurus-国际化方案)
3. [性能优化实践](#3-性能优化实践)
4. [部署与监控](#4-部署与监控)

---

## 1. Git 工作流规范

### 核心原则

**禁止直接向 `master` 分支提交！**

所有改动必须通过 PR 流程：
1. 创建特性分支
2. 推送云端验证 CI
3. 创建 PR
4. CI 通过后合并

### 分支命名规范

| 类型 | 用途 | 示例 |
|------|------|------|
| `feature/` | 新功能 | `feature/ai-column` |
| `fix/` | Bug 修复 | `fix/i18n-navigation` |
| `docs/` | 文档修改 | `docs/add-readme` |
| `style/` | 样式调整 | `style/mobile-navbar` |
| `refactor/` | 代码重构 | `refactor/components` |
| `perf/` | 性能优化 | `perf/fcp-optimization` |
| `chore/` | 构建配置 | `chore/update-deps` |

### 提交信息规范

```
<type>: <description>

[optional body]

[optional footer]
```

**示例：**
```
feat(i18n): 添加 AI 栏目国际化配置

- 创建英文版 intro.md
- 添加 i18n 映射配置
- 更新 _category_.json

Closes #123
```

---

## 2. Docusaurus 国际化方案

### 文件夹命名

**必须使用英文！**

❌ 错误：`docs/ai/72 小时 AI 前沿动态/`  
✅ 正确：`docs/ai/72h-ai-updates/`

### _category_.json 配置

**中文版和英文版必须统一使用英文 label：**

```json
{
  "label": "72h-ai-updates",
  "collapsed": false,
  "link": {
    "type": "generated-index"
  }
}
```

### i18n 映射配置

**中文版** (`i18n/zh-CN/docusaurus-plugin-content-docs/current.json`):
```json
{
  "sidebar.aiSidebar.category.72h-ai-updates": {
    "message": "72 小时 AI 前沿动态",
    "description": "The label for category 72h-ai-updates in sidebar aiSidebar"
  }
}
```

**英文版** (`i18n/en/docusaurus-plugin-content-docs/current.json`):
```json
{
  "sidebar.aiSidebar.category.72h-ai-updates": {
    "message": "72h AI Frontier Updates",
    "description": "The label for category 72h-ai-updates in sidebar aiSidebar"
  }
}
```

**映射 key 格式：** `sidebar.{sidebarId}.category.{label}`

### 文档 Front Matter

**标准格式：**
```markdown
---
sidebar_position: 1
keywords:
  - 关键词 1
  - 关键词 2
---

# 栏目名

该模块主要介绍 XXX 相关的知识，包括...
```

**注意：**
- ❌ 不要加 `sidebar_label`
- ✅ 必须加 `keywords`
- ✅ 标题用 `# 栏目名`

### 英文版文档

**必须添加英文 `title` 字段：**
```markdown
---
sidebar_label: 2026-02-26 19:00 Issue
sidebar_position: 1
title: 2026-02-26 19:00 Issue AI Frontier Updates
---
```

---

## 3. 性能优化实践

### FCP 优化（2026-02-27 实施）

**优化前：** 3.33s  
**优化后：** ~1.8s (预期提升 46%)

#### 优化措施

**1. 延迟加载粒子效果**
```tsx
// src/pages/index.tsx
const [showParticles, setShowParticles] = useState(false);

useEffect(() => {
  const timer = requestAnimationFrame(() => {
    setShowParticles(true);
  });
  return () => cancelAnimationFrame(timer);
}, []);

return (
  <main>
    <Hero />
    {showParticles && <Particles ... />}
  </main>
);
```

**2. 优化 Hero 动画参数**
```tsx
// src/components/Homepage/Hero/index.tsx
const variants: Variants = {
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',      // 改用 tween 替代 spring
      ease: 'easeOut',
      duration: 0.3,      // 缩短 duration
      delay: i * 0.1,     // 减少 delay
    },
  }),
  hidden: { opacity: 0, y: 20 },
};
```

**3. SVGO 压缩 SVG 资源**
```bash
svgo static/img/Homepage/undraw_hero.svg
# 7.5KB → 5.3KB (-30.4%)
```

### 性能监控

**工具：**
- Vercel Speed Insights
- Chrome Lighthouse
- Web Vitals 浏览器扩展

**目标指标：**
- FCP: < 2.0s
- LCP: < 2.5s
- CLS: < 0.1

---

## 4. 部署与监控

### 部署流程

```bash
# 本地构建验证
npm run build

# 推送代码
git push

# GitHub Actions 自动部署
# 查看部署状态
vercel ls

# 查看部署日志
vercel logs <deployment-url>
```

### CI/CD 配置

**GitHub Actions** (`.github/workflows/ci.yml`):
- Lint + TypeScript Check
- Build 验证
- 自动部署到 GitHub Pages

### Vercel 配置

**项目 ID:** `prj_kC2Wdvr8HR10y02YsvaUo9Q75MmP`  
**组织:** `eave-luos-projects`  
**计划:** Hobby (免费)

**免费额度：**
- 带宽：100GB/月
- Serverless: 100 万 GB-秒/月
- Edge 函数：100 万次请求/月

---

## 📖 相关文档

- [Git 工作流详细指南](./GIT_WORKFLOW.md)
- [国际化配置指南](./I18N_GUIDE.md)
- [性能优化记录](./PERFORMANCE_OPTIMIZATION.md)

---

**最后更新**: 2026-02-28  
**维护者**: Eave Luo (@EaveLuo)
