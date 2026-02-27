# eave-web 项目 Skills 配置

本文档列出了 eave-web 项目配置的所有 skills，供 Claude Code 参考使用。

---

## 📦 已配置的 Skills

### 核心 Skills

| Skill | 位置 | 用途 |
|-------|------|------|
| **vercel-cli** | `~/.openclaw/skills/vercel-cli/` | Vercel 部署管理 |
| **github** | 系统内置 | GitHub 操作（PR、Issues、CI） |
| **feishu-doc** | 系统内置 | 飞书文档读写 |
| **weather** | 系统内置 | 天气查询 |

### 代码规范 Skills

| Skill | 位置 | 用途 |
|-------|------|------|
| **vercel-react-best-practices** | `~/.openclaw/skills/` | React/Next.js 性能优化 |
| **next-best-practices** | `~/.openclaw/skills/` | Next.js 最佳实践 |
| **building-components** | `~/.openclaw/skills/` | React 组件构建指南 |
| **vercel-composition-patterns** | `~/.openclaw/skills/` | 组件组合模式 |
| **vercel-web-design-guidelines** | `~/.openclaw/skills/` | Web 设计指南 |

---

## 🔧 Vercel CLI 使用

### 常用命令

```bash
# 查看部署
vercel ls

# 查看部署详情
vercel inspect <deployment-url>

# 查看日志
vercel logs <deployment-url>

# 访问预览部署
vercel curl /api/health --deployment $PREVIEW_URL

# 清除缓存
vercel cache purge
```

### 项目链接

项目已通过 `.vercel/project.json` 链接：
```json
{
  "projectId": "prj_kC2Wdvr8HR10y02YsvaUo9Q75MmP",
  "orgId": "team_CQIEDDATvDa18LxEffJL4ztZ",
  "projectName": "eave-web"
}
```

---

## 📝 使用示例

### 部署检查

```bash
# 1. 查看当前部署
vercel ls

# 2. 查看最新部署日志
vercel logs --follow

# 3. 检查 Speed Insights
# （通过 Vercel Dashboard 查看）
```

### GitHub 操作

```bash
# 创建 PR
gh pr create --base master --head <branch> --title "feat: xxx"

# 查看 PR 状态
gh pr view <number>

# 合并 PR
gh pr merge <number> --merge

# 查看 CI 状态
gh run list --limit 5
```

---

## 🎯 Skills 触发场景

### vercel-react-best-practices

**触发场景：**
- 编写 React 组件
- 优化 bundle 大小
- 数据获取优化
- 性能改进

### next-best-practices

**触发场景：**
- Next.js 文件约定
- RSC 边界
- 路由处理器
- 元数据 API

### building-components

**触发场景：**
- 创建新组件
- 审查组件 API
- 组件重构
- Props 设计

---

## 📚 相关文档

- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [GitHub CLI 文档](https://cli.github.com/)
- [项目知识沉淀](./docs/PROJECT_KNOWLEDGE.md)

---

**最后更新**: 2026-02-28  
**维护者**: Eave Luo (@EaveLuo)
