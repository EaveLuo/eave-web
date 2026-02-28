# Project Instructions for Claude Code

## Role

You are a senior frontend engineer working on eave-web, a bilingual (Chinese/English) documentation website.

## Tech Stack

- Docusaurus 3.9.2
- React 18
- TypeScript
- Tailwind CSS v4
- i18n (zh-CN/en)

## Deployment

- Platform: Vercel (Hobby plan - free tier)
  - 100GB bandwidth/month
  - 1M serverless GB-seconds/month
- CI/CD: GitHub Actions (auto-deploy on push)
- Domain: https://eaveluo.com

## Git Workflow

- NEVER commit directly to `master`
- ALWAYS create a feature branch: `git checkout -b <type>/<description>`
- Branch naming: `feature/`, `fix/`, `docs/`, `style/`, `refactor/`, `perf/`, `chore/`
- Create PR after pushing: `gh pr create`
- Wait for CI to pass before merging

## Coding Rules

- Use TypeScript for all code
- Prefer functional components with hooks
- Use named exports (no default exports)
- Include proper error handling
- Follow existing code style

## When Generating Code

- MUST include TypeScript types
- MUST include error handling
- MUST be production-ready
- MUST follow i18n conventions (English folder names)
- NEVER use Chinese folder names

## i18n Conventions

- Folder names: ALWAYS use English (e.g., `72h-ai-updates`)
- NEVER use Chinese folder names (causes i18n mapping issues)
- `_category_.json`: Use English `label`
- Add i18n mappings in `i18n/zh-CN/current.json` and `i18n/en/current.json`
- Mapping key format: `sidebar.{sidebarId}.category.{label}`
- Example: `72h-ai-updates` → `72 小时 AI 前沿动态` (zh-CN) / `72h AI Frontier Updates` (en)

## Performance Goals

- FCP: < 2.0s (achieved: ~1.8s, optimized from 3.33s)
- LCP: < 2.5s
- CLS: < 0.1

### Key Optimizations (2026-02-27)
- Lazy load particles with `requestAnimationFrame`
- Changed animation from spring to tween (faster)
- Reduced animation delays (0.2s → 0.1s)
- Compressed SVG assets with SVGO (7.5KB → 5.3KB, -30%)

## Project Structure

```
eave-web/
├── docs/              # Documentation (front-end, back-end, operation, ai)
├── i18n/              # Internationalization (zh-CN, en)
├── src/               # Source code (components, pages, theme)
├── static/            # Static assets
├── .claude/           # AI collaboration layer
└── .github/workflows/ # CI/CD
```

## Quick Commands

```bash
npm run start      # Local development
npm run build      # Production build
npm run typecheck  # TypeScript check
vercel ls          # View deployments
```

## Current Mission: Go 教程重构

**Task**: 重构 Go 语言教程，按照 gopl-zh 的 13 章结构

**Source**: https://golang-china.github.io/gopl-zh/

**Target Structure**:
- Ch1 入门 (8 节)
- Ch2 程序结构 (7 节)
- Ch3 基础数据类型 (6 节)
- Ch4 复合数据类型 (6 节)
- Ch5 函数 (10 节)
- Ch6 方法 (6 节)
- Ch7 接口 (15 节)
- Ch8 Goroutines 和 Channels (10 节)
- Ch9 基于共享变量的并发 (8 节)
- Ch10 包和工具 (7 节)
- Ch11 测试 (6 节)
- Ch12 反射 (9 节)
- Ch13 底层编程 (5 节)

**Quality Requirements**:
- 每篇文章必须包含代码示例
- 内容准确，参考 gopl-zh
- 从 0-1 渐进式学习
- 中文写作，清晰简洁

## 🚨 Critical Lessons Learned (2026-03-01)

### Git/PR Workflow Violations

**NEVER do these:**
- ❌ Commit directly to `master` without PR
- ❌ Create PR before CI/CD passes
- ❌ Assume local build success = CI success
- ❌ Force push to `master` to rollback mistakes

**ALWAYS do these:**
- ✅ Create feature branch first: `git checkout -b <type>/<description>`
- ✅ Run full CI check before creating PR: `gh run list --branch <branch-name>`
- ✅ Wait for ALL CI jobs to pass (both `lint-and-typecheck` and `build`)
- ✅ Only create PR after CI passes on remote
- ✅ Use `gh run view <run-id> --log` to debug CI failures
- ✅ Fix broken links before committing (Docusaurus strict mode)

### CI/CD Verification Checklist

Before asking for review:

```bash
# 1. Check CI status
gh run list --branch <branch-name> --limit 3

# 2. Verify ALL jobs passed
# - lint-and-typecheck: success
# - build: success

# 3. If failed, check logs
gh run view <run-id> --log

# 4. Only then create PR
gh pr create --title "<title>" --body "<description>"
```

### Docusaurus Build Requirements

- ✅ No broken Markdown links (run `npm run build` locally first)
- ✅ All internal links must reference existing `.md` files
- ✅ Front matter must be valid YAML
- ✅ sidebar_position must be unique within category

### Role Separation

**Content Writer (Human/Assistant):**
- Write documentation content
- Ensure accuracy and completeness

**Engineering (Claude Code):**
- Create feature branches
- Run validation (npm run build)
- Fix technical issues (broken links, etc.)
- Create PR after CI passes
- Monitor CI/CD pipeline

**NEVER mix these roles!**
