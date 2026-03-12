---
title: OpenClaw 多智能体架构深度解析
description: 全面剖析 OpenClaw 多智能体系统的设计理念、通信模式、会话管理与编排机制
author: Eave
date: 2026-03-13
tags: [openclaw, multi-agent, architecture, ai]
category: ai
---

# OpenClaw 多智能体架构深度解析

## 概述

OpenClaw 是一个开源的 AI 智能体编排框架，其多智能体架构设计旨在解决复杂任务场景下的智能体协作问题。与传统的单智能体系统不同，OpenClaw 采用了一种**分层隔离、动态编排**的设计理念，允许用户部署多个具有独立身份、记忆和工具集的 AI 智能体，并通过灵活的绑定机制实现消息路由和任务分发。

本文将深入探讨 OpenClaw 多智能体系统的核心架构、通信模式、会话管理机制以及实际应用场景，帮助开发者理解如何构建可扩展、安全且高效的多智能体应用。

---

## 一、核心架构设计

### 1.1 智能体隔离模型

OpenClaw 采用**完全隔离的智能体模型**，每个智能体（Agent）都是一个独立的"大脑"，拥有以下独立资源：

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Gateway                         │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│   Agent A   │   Agent B   │   Agent C   │     Agent D       │
│  (coding)   │   (social)  │   (main)    │    (support)      │
├─────────────┼─────────────┼─────────────┼───────────────────┤
│ Workspace   │ Workspace   │ Workspace   │   Workspace       │
│  ~/.openclaw│ ~/.openclaw │ ~/.openclaw │  ~/.openclaw      │
│ /workspace  │ /workspace  │ /workspace  │  /workspace       │
│   -coding   │   -social   │             │   -support        │
├─────────────┼─────────────┼─────────────┼───────────────────┤
│ agentDir    │ agentDir    │ agentDir    │   agentDir        │
│  auth-profiles│ auth-profiles│ auth-profiles│ auth-profiles │
│  model.json │  model.json │  model.json │   model.json      │
├─────────────┼─────────────┼─────────────┼───────────────────┤
│ Sessions    │ Sessions    │ Sessions    │   Sessions        │
│  agent:coding│ agent:social│ agent:main  │   agent:support   │
│  :main      │  :main      │  :main      │   :main           │
│  agent:coding│ agent:social│ agent:main  │   agent:support   │
│  :subagent:*│  :subagent:*│  :subagent:*│   :subagent:*     │
└─────────────┴─────────────┴─────────────┴───────────────────┘
```

**关键隔离原则：**

- **工作区隔离**：每个智能体拥有独立的工作目录，包含 `AGENTS.md`、`SOUL.md`、`USER.md` 等身份配置文件
- **认证隔离**：`auth-profiles.json` 按智能体分离，避免凭证冲突
- **会话隔离**：会话存储在 `~/.openclaw/agents/<agentId>/sessions` 下，不同智能体的会话完全独立
- **技能隔离**：每个智能体通过 `skills/` 目录加载专属技能，共享技能可从 `~/.openclaw/skills` 获取

### 1.2 单智能体 vs 多智能体模式

**单智能体模式（默认）：**

```json5
// 默认配置，agentId = "main"
{
  agents: {
    list: [
      { id: "main", workspace: "~/.openclaw/workspace" }
    ]
  }
}
```

- 会话键格式：`agent:main:<mainKey>`
- 工作区：`~/.openclaw/workspace`
- 状态目录：`~/.openclaw/agents/main/agent`

**多智能体模式：**

```json5
{
  agents: {
    list: [
      { id: "alex", workspace: "~/.openclaw/workspace-alex", default: true },
      { id: "mia", workspace: "~/.openclaw/workspace-mia" },
      { id: "coding", workspace: "~/.openclaw/workspace-coding" }
    ]
  }
}
```

- 支持多个独立智能体并行运行
- 每个智能体可绑定不同的通道账户
- 通过 `bindings` 配置消息路由规则

---

## 二、消息路由与绑定机制

### 2.1 绑定（Bindings）系统

绑定是 OpenClaw 消息路由的核心机制，决定入站消息如何分配给特定智能体。

**绑定匹配优先级（从高到低）：**

```
1. peer 匹配（精确 DM/群组/频道 ID）
2. parentPeer 匹配（线程继承）
3. guildId + roles（Discord 角色路由）
4. guildId（Discord 服务器）
5. teamId（Slack 团队）
6. accountId 匹配（通道账户）
7. 通道级匹配（accountId: "*"）
8. 默认智能体回退
```

### 2.2 配置示例

**多 WhatsApp 号码路由：**

```json5
{
  agents: {
    list: [
      { id: "personal", workspace: "~/.openclaw/workspace-personal" },
      { id: "business", workspace: "~/.openclaw/workspace-business" }
    ]
  },
  bindings: [
    {
      agentId: "personal",
      match: { channel: "whatsapp", accountId: "personal" }
    },
    {
      agentId: "business",
      match: { channel: "whatsapp", accountId: "business" }
    }
  ],
  channels: {
    whatsapp: {
      accounts: {
        personal: { /* 个人号码配置 */ },
        business: { /* 商业号码配置 */ }
      }
    }
  }
}
```

**Discord 多机器人配置：**

```json5
{
  agents: {
    list: [
      { id: "main", workspace: "~/.openclaw/workspace-main" },
      { id: "coding", workspace: "~/.openclaw/workspace-coding" }
    ]
  },
  bindings: [
    { 
      agentId: "main", 
      match: { channel: "discord", accountId: "default" } 
    },
    { 
      agentId: "coding", 
      match: { channel: "discord", accountId: "coding" } 
    }
  ],
  channels: {
    discord: {
      accounts: {
        default: {
          token: "DISCORD_BOT_TOKEN_MAIN",
          guilds: {
            "123456789012345678": {
              channels: {
                "222222222222222222": { allow: true }
              }
            }
          }
        },
        coding: {
          token: "DISCORD_BOT_TOKEN_CODING",
          guilds: {
            "123456789012345678": {
              channels: {
                "333333333333333333": { allow: true }
              }
            }
          }
        }
      }
    }
  }
}
```

### 2.3 路由规则详解

**AND 语义：**

当绑定设置多个匹配字段（如 `peer` + `guildId`）时，所有指定字段必须同时匹配。

**账户范围细节：**

- 省略 `accountId` 的绑定仅匹配默认账户
- 使用 `accountId: "*"` 实现通道级回退，跨所有账户
- 后续添加的显式账户绑定会升级现有通道级绑定

---

## 三、子智能体（Sub-agents）系统

### 3.1 子智能体概述

子智能体是从现有智能体运行中派生的后台智能体实例，用于并行处理任务而不阻塞主智能体。

**核心特性：**

- 独立会话：`agent:<agentId>:subagent:<uuid>`
- 完成后向请求者频道宣布结果
- 支持嵌套（最大深度可配置）
- 默认受限工具策略

### 3.2 会话键层级结构

```
Depth 0: agent:<id>:main              (主智能体)
         └─ 可生成子智能体
            
Depth 1: agent:<id>:subagent:<uuid>   (子智能体)
         └─ maxSpawnDepth: 2 时可继续生成
            
Depth 2: agent:<id>:subagent:<uuid>   (孙智能体 - 工作器)
```

### 3.3 子智能体操作命令

**Slash 命令：**

```bash
# 列出当前会话的所有子智能体
/subagents list

# 终止特定子智能体（级联终止其子项）
/subagents kill <id|#|all>

# 查看子智能体日志
/subagents log <id|#> [limit] [tools]

# 获取子智能体元数据
/subagents info <id|#>

# 向子智能体发送消息
/subagents send <id|#> <message>

# 引导/调整子智能体行为
/subagents steer <id|#> <message>

# 手动生成子智能体
/subagents spawn <agentId> <task> [--model <model>] [--thinking <level>]
```

**工具调用（sessions_spawn）：**

```json
{
  "task": "分析代码库并找出潜在的安全漏洞",
  "label": "security-audit",
  "model": "gpt-4o",
  "thinking": "high",
  "runTimeoutSeconds": 900,
  "thread": true,
  "mode": "session",
  "cleanup": "keep",
  "sandbox": "inherit"
}
```

### 3.4 嵌套子智能体配置

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2,           // 允许子智能体生成子智能体（默认：1）
        maxChildrenPerAgent: 5,     // 每个智能体最大活跃子项数（默认：5）
        maxConcurrent: 8,           // 全局并发通道上限（默认：8）
        runTimeoutSeconds: 900,     // 默认超时（0 = 无超时）
        archiveAfterMinutes: 60,    // 自动归档时间
        model: "gpt-4o-mini",       // 子智能体默认模型
        thinking: "medium"          // 默认思考级别
      }
    }
  }
}
```

### 3.5 线程绑定会话

支持线程绑定的通道（当前仅 Discord）：

```bash
# 将线程绑定到子智能体会话
/focus <subagent-label|session-key|session-id>

# 解除绑定
/unfocus

# 列出活跃运行和绑定状态
/agents

# 设置空闲超时
/session idle <duration|off>

# 设置最大存活时间
/session max-age <duration|off>
```

---

## 四、会话管理与隔离

### 4.1 会话类型

OpenClaw 支持多种会话类型，每种都有特定的使用场景：

| 会话类型 | 会话键格式 | 用途 |
|---------|-----------|------|
| 主会话 | `agent:<id>:main` | 用户与智能体的主要交互 |
| 子智能体会话 | `agent:<id>:subagent:<uuid>` | 后台任务执行 |
| ACP 会话 | `agent:<id>:acp:<uuid>` | 外部编码工具集成 |
| DM 会话 | `agent:<id>:<channel>:dm:<identifier>` | 私信隔离 |
| 群组会话 | `agent:<id>:<channel>:group:<identifier>` | 群组聊天隔离 |

### 4.2 会话沙盒

默认情况下，会话是沙盒化的以保护主机免受不受信任的输入影响：

```
┌─────────────────────────────────────────┐
│           Gateway Process               │
│  ┌─────────────────────────────────┐    │
│  │        Session Sandbox          │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │    Agent Execution      │    │    │
│  │  │  - Tool calls           │    │    │
│  │  │  - File operations      │    │    │
│  │  │  - Network requests     │    │    │
│  │  │  (restricted by policy) │    │    │
│  │  └─────────────────────────┘    │    │
│  │         ↕  IPC / WebSocket                    │    │
│  └─────────────────────────────────┘    │
│         ↕  Gateway API                  │
└─────────────────────────────────────────┘
```

**沙盒策略：**

- 相对路径解析在智能体工作区内
- 绝对路径可访问其他主机位置（除非启用沙盒）
- 每个智能体可配置独立的工具允许/拒绝策略
- 工作区访问控制防止智能体间上下文泄漏

### 4.3 会话生命周期

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Created │───▶│ Active  │───▶│ Paused  │───▶│ Resumed │───▶│Archived │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                    │                              ▲
                    └──────────────────────────────┘
                           (auto after idle)
```

**自动归档机制：**

- 子智能体会话在 `archiveAfterMinutes`（默认 60 分钟）后自动归档
- 归档使用 `sessions.delete` 并将转录本重命名为 `*.deleted.<timestamp>`
- 自动归档是尽力而为；挂起的计时器在网关重启时会丢失

---

## 五、通信模式与协作

### 5.1 智能体间通信

OpenClaw 的智能体间通信遵循**显式优于隐式**的原则：

**直接通信（不推荐）：**

智能体之间不直接通信，而是通过主智能体协调。

**间接通信（推荐）：**

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Agent A │◀───▶│  Main   │◀───▶│ Agent B │
│(Worker1)│     │(Orchestrator)│  │(Worker2)│
└─────────┘     └─────────┘     └─────────┘
       ▲                              ▲
       └──────────┬───────────────────┘
                  │
           (via sessions_spawn)
```

### 5.2 编排模式

**顺序编排（Sequential）：**

```yaml
# 工作流定义示例
steps:
  - name: research
    agent: researcher
    task: "收集关于主题的背景信息"
    
  - name: write
    agent: writer
    depends_on: [research]
    task: "基于研究结果撰写文章"
    
  - name: review
    agent: reviewer
    depends_on: [write]
    task: "审核文章质量"
```

**并行编排（Parallel）：**

```yaml
steps:
  - name: analyze_code
    parallel:
      - agent: security_analyst
        task: "安全审计"
      - agent: performance_expert
        task: "性能分析"
      - agent: test_engineer
        task: "测试覆盖率检查"
    aggregate: "synthesize_results"
```

**分层编排（Hierarchical）：**

```
                    ┌─────────────┐
                    │   Main      │
                    │  Agent      │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐    ┌──────────┐    ┌──────────┐
     │Orchestrator│   │Orchestrator│   │Orchestrator│
     │  (Dev)     │   │  (Ops)     │   │  (QA)      │
     └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
           │                │                │
     ┌─────┴─────┐    ┌─────┴─────┐    ┌─────┴─────┐
     ▼     ▼     ▼    ▼     ▼     ▼    ▼     ▼     ▼
   [W1]  [W2]  [W3] [W4]  [W5]  [W6] [W7]  [W8]  [W9]
```

### 5.3 结果聚合模式

**投票模式：**

```javascript
// 多个智能体对同一任务投票
const votes = await Promise.all([
  spawnAgent('critic', '评估方案A'),
  spawnAgent('critic', '评估方案B'),
  spawnAgent('critic', '评估方案C')
]);

const bestOption = aggregateVotes(votes);
```

**专家委员会模式：**

```javascript
// 不同专家从不同角度评估
const results = await Promise.all([
  spawnAgent('security_expert', '安全分析'),
  spawnAgent('performance_expert', '性能分析'),
  spawnAgent('ux_expert', '用户体验分析')
]);

const finalReport = synthesize(results);
```

---

## 六、实际应用场景

### 6.1 多租户客服系统

**场景描述：**

一家企业需要为不同产品线部署独立的客服智能体，同时保持统一的网关基础设施。

**架构设计：**

```json5
{
  agents: {
    list: [
      { id: "product-a-support", workspace: "~/.openclaw/workspace-product-a" },
      { id: "product-b-support", workspace: "~/.openclaw/workspace-product-b" },
      { id: "enterprise-support", workspace: "~/.openclaw/workspace-enterprise" }
    ]
  },
  bindings: [
    {
      agentId: "product-a-support",
      match: { channel: "discord", accountId: "product-a-bot" }
    },
    {
      agentId: "product-b-support",
      match: { channel: "discord", accountId: "product-b-bot" }
    },
    {
      agentId: "enterprise-support",
      match: { channel: "slack", guildId: "enterprise-workspace" }
    }
  ]
}
```

**优势：**

- 每个产品线拥有独立的记忆和知识库
- 客户数据完全隔离
- 可独立更新各智能体的配置和技能

### 6.2 开发团队多智能体流水线

**场景描述：**

软件开发团队需要自动化代码审查、测试和文档生成流程。

**架构设计：**

```
┌─────────────────────────────────────────────────────────┐
│                    Dev Pipeline                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐ │
│  │  Code   │──▶│ Security│──▶│  Test   │──▶│  Docs   │ │
│  │ Reviewer│   │ Auditor │   │ Runner  │   │Generator│ │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘ │
│       │            │            │            │          │
│       └────────────┴────────────┴────────────┘          │
│                    │                                    │
│              ┌─────────┐                                │
│              │Orchestrator                             │
│              │ (Main Agent)                            │
│              └─────────┘                                │
└─────────────────────────────────────────────────────────┘
```

**实现代码：**

```javascript
// 主智能体协调开发流水线
async function devPipeline(codeChanges) {
  // 并行启动多个子智能体
  const [review, security] = await Promise.all([
    sessions_spawn({
      task: `审查代码变更: ${codeChanges}`,
      label: "code-review",
      model: "gpt-4o"
    }),
    sessions_spawn({
      task: `安全审计: ${codeChanges}`,
      label: "security-audit",
      model: "claude-3-opus"
    })
  ]);
  
  // 根据结果决定是否继续
  if (review.approved && security.passed) {
    const [tests, docs] = await Promise.all([
      sessions_spawn({ task: "运行测试套件", label: "test-runner" }),
      sessions_spawn({ task: "更新API文档", label: "docs-generator" })
    ]);
    
    return { review, security, tests, docs };
  }
}
```

### 6.3 个人多智能体助手

**场景描述：**

个人用户希望拥有多个专门化的智能体处理不同领域任务。

**配置示例：**

```json5
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/.openclaw/workspace-personal",
        default: true,
        description: "通用个人助手"
      },
      {
        id: "coding",
        workspace: "~/.openclaw/workspace-coding",
        description: "编程专家",
        runtime: {
          type: "acp",
          acp: { agent: "codex", mode: "persistent" }
        }
      },
      {
        id: "writing",
        workspace: "~/.openclaw/workspace-writing",
        description: "写作助手"
      },
      {
        id: "research",
        workspace: "~/.openclaw/workspace-research",
        description: "研究分析师",
        subagents: {
          model: "gpt-4o",
          maxSpawnDepth: 2
        }
      }
    ]
  },
  bindings: [
    { agentId: "personal", match: { channel: "telegram", accountId: "personal" } },
    { agentId: "coding", match: { channel: "discord", peer: { id: "coding-channel" } } },
    { agentId: "writing", match: { channel: "telegram", peer: { id: "+15551230001" } } }
  ]
}
```

---

## 七、最佳实践

### 7.1 智能体设计原则

**单一职责原则：**

每个智能体应该专注于一个明确的领域或任务类型。

```
❌ 反例：一个智能体同时处理编程、写作和数据分析
✅ 正例：coding-agent、writing-agent、analysis-agent 分离
```

**最小权限原则：**

```json5
{
  agents: {
    list: [
      {
        id: "restricted-agent",
        tools: {
          allow: ["read", "web_search"],  // 仅允许读取和搜索
          deny: ["write", "exec", "message"]  // 禁止写入和执行
        }
      }
    ]
  }
}
```

### 7.2 性能优化

**模型选择策略：**

```json5
{
  agents: {
    defaults: {
      model: "gpt-4o",  // 主智能体使用高质量模型
      subagents: {
        model: "gpt-4o-mini",  // 子智能体使用成本效益模型
        thinking: "low"  // 降低思考深度以节省token
      }
    }
  }
}
```

**并发控制：**

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxConcurrent: 5,  // 限制全局并发数
        maxChildrenPerAgent: 3,  // 限制每个智能体的子项数
        runTimeoutSeconds: 600  // 设置合理的超时
      }
    }
  }
}
```

### 7.3 安全与隔离

**工作区隔离检查清单：**

- [ ] 每个智能体使用独立的 `agentDir`
- [ ] 从不跨智能体复用 `agentDir`
- [ ] 敏感凭证存储在 `auth-profiles.json` 中
- [ ] 启用沙盒模式处理不受信任的输入
- [ ] 配置工具允许/拒绝策略

**会话安全：**

```json5
{
  session: {
    sandbox: {
      enabled: true,
      allowPaths: ["/workspace"],
      denyPaths: ["/etc", "/root", "~/.ssh"]
    }
  }
}
```

### 7.4 监控与调试

**日志查看：**

```bash
# 查看特定子智能体的日志
openclaw subagents log <id> --tools

# 实时监控所有子智能体
openclaw subagents list --watch

# 导出会话转录
openclaw sessions export <session-id> --format json
```

**指标监控：**

```json5
{
  agents: {
    defaults: {
      telemetry: {
        enabled: true,
        metrics: ["token_usage", "latency", "error_rate"],
        export: {
          type: "prometheus",
          endpoint: "http://metrics:9090"
        }
      }
    }
  }
}
```

---

## 八、常见问题与解决方案

### 8.1 智能体不生成子智能体

**问题：** 调用 `sessions_spawn` 没有反应

**排查步骤：**

1. 检查工具策略是否允许 `sessions_spawn`
2. 确认当前智能体未达到 `maxChildrenPerAgent` 限制
3. 验证模型支持工具调用
4. 检查网关日志中的权限错误

### 8.2 会话上下文泄漏

**问题：** 不同智能体间出现意外的上下文共享

**解决方案：**

- 确保每个智能体有独立的 `workspace` 路径
- 检查 `agentDir` 配置是否正确分离
- 验证会话键格式符合规范

### 8.3 绑定路由不生效

**问题：** 消息未路由到预期的智能体

**排查步骤：**

1. 使用 `openclaw agents list --bindings` 验证绑定配置
2. 检查匹配条件的优先级顺序
3. 确认通道账户配置正确
4. 查看网关日志中的路由决策

---

## 九、未来发展趋势

### 9.1 智能体市场与生态

OpenClaw 社区正在发展智能体市场，允许用户分享和复用预配置的智能体：

```
┌─────────────────────────────────────────┐
│          OpenClaw Hub                   │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Security │ │ DevOps  │ │ Writing │  │
│  │ Agent   │ │ Agent   │ │ Agent   │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Research │ │ Analysis│ │ Support │  │
│  │ Agent   │ │ Agent   │ │ Agent   │  │
│  └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────┘
```

### 9.2 智能体间协议标准化

行业正在探索智能体间通信的标准协议：

- **MCP (Model Context Protocol)**：标准化智能体与数据源的交互
- **ACP (Agent Client Protocol)**：标准化智能体与编辑器的集成
- **A2A (Agent-to-Agent)**：智能体间直接通信协议（探索中）

### 9.3 自主智能体网络

未来可能出现完全自主的智能体网络：

```
┌─────────────────────────────────────────┐
│      Autonomous Agent Network           │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────┐    ┌─────┐    ┌─────┐       │
│   │Agent│◀──▶│Agent│◀──▶│Agent│       │
│   │  A  │    │  B  │    │  C  │       │
│   └──┬──┘    └──┬──┘    └──┬──┘       │
│      │          │          │           │
│      └──────────┼──────────┘           │
│                 │                      │
│            ┌────┴────┐                 │
│            │Consensus│                 │
│            │ Layer   │                 │
│            └─────────┘                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## 十、总结

OpenClaw 的多智能体架构提供了一个强大而灵活的平台，用于构建复杂的 AI 应用。其核心设计理念包括：

1. **完全隔离**：每个智能体拥有独立的工作区、认证和会话
2. **灵活路由**：通过绑定机制实现精细化的消息分发
3. **层级编排**：支持嵌套子智能体，实现复杂的工作流
4. **安全第一**：默认沙盒化和工具策略控制
5. **可扩展性**：从单智能体到多智能体集群的无缝扩展

通过遵循本文介绍的最佳实践，开发者可以构建出既安全又高效的多智能体系统，满足从个人助手到企业级应用的广泛需求。

---

## 参考资源

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [Multi-Agent Routing](https://docs.openclaw.ai/concepts/multi-agent)
- [Sub-Agents](https://docs.openclaw.ai/tools/subagents)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Agent Client Protocol](https://agentclientprotocol.com/)
- [Azure AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
