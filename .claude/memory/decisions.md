# Architecture Decisions

## 2026-02-27: FCP Optimization

**Decision**: Optimize homepage FCP from 3.33s to ~1.8s

**Context**: 
- Initial FCP was 3.33s, impacting user experience
- Particles animation was blocking first paint
- Hero animations had excessive delays

**Options Considered**:
1. Remove particles entirely
2. Lazy load particles (chosen)
3. Reduce particle count

**Outcome**:
- Lazy load particles with `requestAnimationFrame`
- Changed animation from spring to tween
- Reduced animation delays (0.2s → 0.1s)
- Compressed SVG assets (7.5KB → 5.3KB, -30%)

**Result**: FCP 3.33s → 1.8s (46% improvement)

---

## 2026-02-27: i18n Folder Naming

**Decision**: ALWAYS use English folder names for i18n

**Context**:
- Initial setup used Chinese folder names (`72 小时 AI 前沿动态/`)
- Caused i18n mapping issues
- English version showed Chinese text

**Options Considered**:
1. Keep Chinese names + fix mappings
2. Use English names + i18n mappings (chosen)

**Outcome**:
- Folder: `72h-ai-updates/`
- Label in `_category_.json`: `72h-ai-updates`
- Chinese mapping: `72h-ai-updates` → `72 小时 AI 前沿动态`
- English mapping: `72h-ai-updates` → `72h AI Frontier Updates`

**Result**: Both languages display correctly

---

## 2026-02-28: .claude/ Directory Structure

**Decision**: Adopt production-grade .claude/ structure

**Context**:
- Initial setup had skills in wrong location
- Needed proper AI collaboration layer

**Structure Adopted**:
```
.claude/
├── CLAUDE.md          # Global instructions
├── rules/             # Team rules (frontend.md, commit.md)
├── context/           # Project knowledge (project.md, tech-stack.md)
├── skills/            # Prompt skills (i18n-setup.md, perf-optimize.md)
├── prompts/           # Reusable prompts (pr-review.md)
└── memory/            # Decision log (decisions.md)
```

**Result**: Better AI collaboration and consistency

---

## 2026-02-28: Project Documentation Cleanup

**Decision**: Remove redundant documentation files

**Context**:
- Initial setup had duplicate documentation
- PROJECT_KNOWLEDGE.md duplicated .claude/ content
- SKILLS.md was unnecessary (skills are in .claude/skills/)
- .claude/config.json not needed
- .vercel/ files should not be committed

**Files Removed**:
- `.claude/config.json`
- `SKILLS.md`
- `docs/PROJECT_KNOWLEDGE.md`
- `.vercel/README.txt`
- `.vercel/project.json`

**Content Migration**:
- Git workflow → `.claude/CLAUDE.md`
- i18n conventions → `.claude/CLAUDE.md`
- Performance optimizations → `.claude/CLAUDE.md` + `.claude/memory/decisions.md`
- Deployment info → `.claude/CLAUDE.md` + `.claude/context/tech-stack.md`

**Result**: Cleaner project structure, no duplication
