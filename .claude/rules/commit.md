# Git Commit Standards

## Commit Message Format

```
<type>: <description>

[optional body]

[optional footer]
```

## Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build/config changes

## Rules

- ALWAYS use imperative mood ("add" not "added")
- NEVER end subject line with a period
- Limit subject line to 50 characters
- Wrap body at 72 characters
- ALWAYS reference issues/PRs in footer when applicable

## Examples

```
feat(i18n): add AI column internationalization

- Create English intro.md
- Add i18n mapping configuration
- Update _category_.json

Closes #123
```

```
perf(fcp): optimize first contentful paint

- Lazy load particles component
- Reduce animation delays (0.2s → 0.1s)
- Compress SVG assets (7.5KB → 5.3KB, -30%)

FCP: 3.33s → 1.8s (46% improvement)
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Refactoring
- `perf/description` - Performance
