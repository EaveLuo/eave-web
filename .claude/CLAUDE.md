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

- Platform: Vercel (Hobby plan)
- CI/CD: GitHub Actions
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
- `_category_.json`: Use English `label`
- Add i18n mappings in `i18n/zh-CN/current.json` and `i18n/en/current.json`
- Mapping key format: `sidebar.{sidebarId}.category.{label}`

## Performance Goals

- FCP: < 2.0s (current: ~1.8s)
- LCP: < 2.5s
- CLS: < 0.1

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
