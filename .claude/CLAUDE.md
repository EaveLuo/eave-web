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

### 🚨 CRITICAL: i18n Translation Workflow

**ALWAYS run this command after ANY sidebar/category changes:**

```bash
npm run write-translations
```

This command auto-generates translation keys in `i18n/{locale}/docusaurus-plugin-content-docs/current.json`.

**When to run:**
- ✅ After adding new category/folder
- ✅ After renaming category
- ✅ After modifying `_category_.json` label
- ✅ After changing sidebar structure

**Manual verification:**
```bash
# Check if translation keys exist
cat i18n/en/docusaurus-plugin-content-docs/current.json | grep "sidebar."

# Example output:
# "sidebar.aiSidebar.category.72h AI 前沿": {
#   "message": "72h AI Frontier Updates"
# }
```

**Common mistake:**
- ❌ Only updating `_category_.json` label (doesn't affect sidebar display)
- ✅ Running `write-translations` then editing `current.json` message values

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

## Static Asset Management (OSS via filelift)

**Large static assets (>100KB) MUST be uploaded to OSS, NOT stored in the repo.**

- Tool: `filelift` CLI (S3-compatible storage → Cloudflare R2)
- Target: `cf-wiki-bucket-apac`
- Public base URL: `https://assets.eaveluo.com`

### Folder Convention

| Asset Type | OSS Folder | Example |
|---|---|---|
| 项目基建资源 (logo, hero, favicon 等) | `eave-web/` | `https://assets.eaveluo.com/eave-web/logo.png` |
| Blog/Docs 文章配图 | `blog/{YYYY}/{MM}/` | `https://assets.eaveluo.com/blog/2026/06/example.png` |

### Upload Workflow

**Docs/Blog 资源 (使用 target 默认 `blog/{yyyy}/{MM}` 路径):**

```bash
filelift upload \
  --target cf-wiki-bucket-apac \
  path/to/file1.png path/to/file2.png
# → https://assets.eaveluo.com/blog/2026/06/file1.png
```

**项目基建资源 (跳过 target 默认路径，手动指定 `eave-web`):**

```bash
filelift upload \
  --target cf-wiki-bucket-apac \
  --ignore-target-folder \
  --folder eave-web \
  path/to/logo.png
# → https://assets.eaveluo.com/eave-web/logo.png
```

**完整流程:**

```bash
# 1. 上传到 OSS（按资源类型选择 folder）
# 2. 将 Markdown/代码中的本地路径替换为返回的 OSS URL
#    e.g. /img/example.png → https://assets.eaveluo.com/blog/2026/06/example.png
# 3. 确认引用全部更新后，删除 static/ 下的本地文件
# 4. npm run build 验证
```

### Rules

- ✅ 文章配图 → `blog/{YYYY}/{MM}/`（target 默认路径，根据文章发布日期填入年月）
- ✅ 项目基建资源 → `eave-web/`（`--ignore-target-folder` + `--folder eave-web`）
- ✅ Upload images >100KB, videos, and other large binaries
- ✅ ALWAYS replace all references before deleting local files
- ✅ Run `npm run build` after migration to verify
- ❌ NEVER keep uploaded assets in `static/` — they waste repo space and Vercel bandwidth
- ❌ DON'T upload favicon.ico, small SVGs (<10KB), or tiny logos — the overhead isn't worth it

## Quick Commands

```bash
npm run start      # Local development
npm run build      # Production build
npm run typecheck  # TypeScript check
vercel ls          # View deployments
```

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

