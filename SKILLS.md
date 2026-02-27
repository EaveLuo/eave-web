# eave-web 项目 Skills 配置

本文档列出了 eave-web 项目配置的所有 skills，供 Claude Code 参考使用。

---

## 📦 项目 Skills

以下 skills 已复制到项目内部（`.claude/skills/`），Claude Code 应优先使用这些项目级 skills。

### 代码规范 Skills

| Skill | 位置 | 用途 |
|-------|------|------|
| **vercel-react-best-practices** | `.claude/skills/vercel-react-best-practices/` | React/Next.js 性能优化 |
| **next-best-practices** | `.claude/skills/next-best-practices/` | Next.js 最佳实践 |
| **building-components** | `.claude/skills/building-components/` | React 组件构建指南 |
| **vercel-composition-patterns** | `.claude/skills/vercel-composition-patterns/` | 组件组合模式 |
| **vercel-web-design-guidelines** | `.claude/skills/vercel-web-design-guidelines/` | Web 设计指南 |

### 工具 Skills

| Skill | 位置 | 用途 |
|-------|------|------|
| **vercel-cli** | 系统技能 | Vercel 部署管理 |
| **github** | 系统技能 | GitHub 操作（PR、Issues、CI） |

---

## 🎯 Skills 触发场景

### vercel-react-best-practices

**触发场景：**
- 编写 React 组件
- 优化 bundle 大小
- 数据获取优化
- 性能改进

**核心规则：**
- 消除 Waterfalls（async 前缀）
- Bundle 优化（bundle 前缀）
- 服务端性能（server 前缀）
- 客户端数据获取（client 前缀）

### next-best-practices

**触发场景：**
- Next.js 文件约定
- RSC 边界
- 数据模式
- 异步 API
- 元数据 API
- 错误处理
- 路由处理器
- 图片/字体优化

### building-components

**触发场景：**
- 创建新组件
- 审查组件 API
- 组件重构
- Props 设计
- 组件组合模式

**核心原则：**
- 单一职责
- 组合优于继承
- Props 设计简洁
- 状态就近原则

### vercel-composition-patterns

**触发场景：**
- 组件组合模式设计
- Compound Components
- Render Props
- Hooks 复用

### vercel-web-design-guidelines

**触发场景：**
- UI 审查
- 可访问性检查
- 设计审计
- UX 优化

---

## 🔧 工具 Skills 使用

### vercel-cli

**常用命令：**

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

**项目配置：**
```json
{
  "projectId": "prj_kC2Wdvr8HR10y02YsvaUo9Q75MmP",
  "orgId": "team_CQIEDDATvDa18LxEffJL4ztZ",
  "projectName": "eave-web"
}
```

### github

**常用命令：**

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

## 📁 Skills 目录结构

```
eave-web/
├── .claude/
│   ├── CLAUDE.md               # Claude Code 主配置
│   ├── config.json             # Claude Code 配置
│   ├── rules/                  # 团队规则
│   ├── context/                # 项目知识
│   ├── skills/                 # 项目级 Skills
│   ├── prompts/                # Prompt 模板
│   └── memory/                 # 决策记录
└── SKILLS.md                   # 本文件
```

---

## 📚 相关文档

- [CLAUDE.md](./.claude/CLAUDE.md) - Claude Code 主配置
- [项目知识沉淀](./docs/PROJECT_KNOWLEDGE.md) - 项目经验总结
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [GitHub CLI 文档](https://cli.github.com/)

---

**最后更新**: 2026-02-28  
**维护者**: Eave Luo (@EaveLuo)
