# PR Review Prompt

Use this prompt when reviewing pull requests:

---

## PR Review Checklist

### Code Quality

- [ ] TypeScript types are correct
- [ ] No `any` types used
- [ ] Error handling is included
- [ ] Code follows existing patterns

### Performance

- [ ] No unnecessary re-renders
- [ ] Heavy components are lazy-loaded
- [ ] Images/assets are optimized

### i18n

- [ ] Chinese and English versions are updated
- [ ] Folder names use English
- [ ] i18n mappings are added

### Documentation

- [ ] Commit message follows convention
- [ ] PR description is clear
- [ ] Related issues are referenced

### Testing

- [ ] CI passes (build + typecheck)
- [ ] No console errors
- [ ] Manual testing completed

### Security

- [ ] No sensitive data exposed
- [ ] Dependencies are up to date
- [ ] No security vulnerabilities

---

## Review Response Template

```markdown
## Review Summary

✅ **Approved** / ⚠️ **Changes Requested**

## Feedback

### ✅ Good Points
- ...

### 🔧 Suggested Changes
- ...

### ❓ Questions
- ...
```
