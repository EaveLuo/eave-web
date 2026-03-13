---
title: ACP (Agent Collaboration Protocol) 深度解析
description: 深入理解 ACP 协议规范、智能体间通信机制以及与 Claude Code、Codex 等工具的集成
author: Eave
date: 2026-03-13
tags: [openclaw, acp, agent-protocol, claude-code, codex]
category: ai
sidebar_position: 1
---

# ACP (Agent Collaboration Protocol) 深度解析

## 概述

Agent Collaboration Protocol（ACP，智能体协作协议）是一个开放标准，旨在实现 AI 智能体与编辑器环境之间的无缝集成。由 Zed Industries 发起并开源，ACP 解决了 AI 辅助开发中的"三应用问题"——开发者需要在编辑器、AI 智能体和浏览器之间不断切换的痛点。

本文将深入探讨 ACP 协议的规范细节、架构设计、与主流编码工具（Claude Code、Codex、Gemini CLI 等）的集成方式，以及在 OpenClaw 中的实际应用。

---

## 一、ACP 协议背景与动机

### 1.1 三应用问题

在传统的 AI 辅助开发工作流中，开发者面临以下挑战：

```
┌─────────────────────────────────────────────────────────┐
│                    传统工作流                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐       │
│   │ Editor  │◀────▶│ AI Agent│◀────▶│ Browser │       │
│   │ (VSCode)│      │(Claude) │      │(Preview)│       │
│   └─────────┘      └─────────┘      └─────────┘       │
│        ▲                ▲                ▲             │
│        └────────────────┴────────────────┘             │
│              频繁的上下文切换                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**主要痛点：**

- **屏幕空间不足**：三分屏导致每个窗口都过于狭窄
- **上下文切换成本**：频繁切换打断心流状态
- **审查困难**：难以同时查看代码变更和预览效果
- **窗口管理复杂**：多窗口布局难以维护

### 1.2 现有解决方案的局限

**IDE 集成方案（如 Cursor）：**

```
优点：深度集成，体验流畅
缺点：供应商锁定，无法混合搭配工具
```

**终端方案：**

```
优点：灵活，可在任意编辑器使用
缺点：界面简陋，需要频繁切换窗口
```

**插件方案：**

```
优点：针对特定编辑器优化
缺点：维护负担重，难以跟上智能体更新速度
```

### 1.3 ACP 的解决方案

ACP 通过标准化协议实现**智能体与编辑器的解耦**：

```
┌─────────────────────────────────────────────────────────┐
│                    ACP 工作流                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐         ACP Protocol         ┌─────────┐│
│   │  Zed    │◀────────────────────────────▶│ Claude  ││
│   │  Editor │      (JSON-RPC over stdio)   │  Code   ││
│   └─────────┘                              └─────────┘│
│        │                                        │      │
│        └────────────────────────────────────────┘      │
│              统一的协议，任意的组合                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**核心优势：**

- **无供应商锁定**：任意 ACP 兼容编辑器 + 任意 ACP 兼容智能体
- **独立演进**：编辑器和智能体可以独立更新
- **一次实现，到处运行**：智能体实现一次 ACP，即可支持所有兼容编辑器
- **标准化接口**：统一的 JSON-RPC 通信协议

---

## 二、ACP 协议规范详解

### 2.1 协议架构

ACP 基于 **JSON-RPC 2.0** 构建，采用**请求-响应**和**通知**两种通信模式：

```
┌─────────────────────────────────────────────────────────┐
│                  ACP Protocol Stack                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Application Layer                   │   │
│  │  - session/initialize   - session/new           │   │
│  │  - session/prompt       - session/update        │   │
│  │  - session/cancel       - session/load          │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              JSON-RPC 2.0 Layer                  │   │
│  │  - Request/Response   - Notification            │   │
│  │  - Error handling     - Batch requests          │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Transport Layer                     │   │
│  │  - stdio (primary)    - WebSocket               │   │
│  │  - Unix socket        - TCP socket              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 核心消息类型

**会话管理消息：**

| 消息类型 | 方向 | 描述 |
|---------|------|------|
| `session/initialize` | Client → Server | 初始化会话，交换能力信息 |
| `session/new` | Client → Server | 创建新会话 |
| `session/load` | Client → Server | 加载现有会话 |
| `session/prompt` | Client → Server | 发送提示词 |
| `session/cancel` | Client → Server | 取消当前操作 |
| `session/update` | Server → Client | 发送响应更新 |
| `session/complete` | Server → Client | 操作完成通知 |

**工具调用消息：**

| 消息类型 | 方向 | 描述 |
|---------|------|------|
| `tool/call` | Server → Client | 请求执行工具 |
| `tool/result` | Client → Server | 返回工具执行结果 |
| `tool/progress` | Client → Server | 工具执行进度更新 |

**通知消息：**

| 消息类型 | 方向 | 描述 |
|---------|------|------|
| `notification/message` | Server → Client | 文本消息通知 |
| `notification/thinking` | Server → Client | 思考过程通知 |
| `notification/error` | Server → Client | 错误通知 |

### 2.3 会话生命周期

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Init   │───▶│   New   │───▶│ Prompt  │───▶│ Update  │───▶│ Complete│
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                    │                              ▲
                    └──────────┬───────────────────┘
                               │
                         ┌─────────┐
                         │  Load   │
                         │(existing)
                         └─────────┘
```

**详细流程：**

1. **Initialize**：客户端和服务器交换能力信息
2. **New/Load**：创建新会话或加载现有会话
3. **Prompt**：客户端发送提示词
4. **Update**：服务器流式返回响应
5. **Complete**：操作完成，会话保持打开

### 2.4 消息格式示例

**Initialize Request：**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "session/initialize",
  "params": {
    "clientInfo": {
      "name": "zed",
      "version": "1.0.0"
    },
    "capabilities": {
      "tools": ["fs/read", "fs/write", "terminal/exec"],
      "streaming": true,
      "thinking": true
    }
  }
}
```

**Initialize Response：**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "serverInfo": {
      "name": "claude-code",
      "version": "2.0.0"
    },
    "capabilities": {
      "models": ["claude-3-opus", "claude-3-sonnet"],
      "maxTokens": 200000,
      "supportsImages": true
    }
  }
}
```

**Prompt Request：**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "session/prompt",
  "params": {
    "sessionId": "session-123",
    "content": [
      {
        "type": "text",
        "text": "分析这个函数的复杂度"
      },
      {
        "type": "resource",
        "resource": {
          "uri": "file:///src/utils.ts",
          "mimeType": "text/typescript"
        }
      }
    ]
  }
}
```

**Streaming Update：**

```json
{
  "jsonrpc": "2.0",
  "method": "session/update",
  "params": {
    "sessionId": "session-123",
    "content": {
      "type": "text",
      "text": "这个函数使用了递归..."
    },
    "done": false
  }
}
```

---

## 三、OpenClaw 中的 ACP 实现

### 3.1 OpenClaw ACP 架构

OpenClaw 通过 ACP 桥接器实现与外部编码工具的集成：

```
┌─────────────────────────────────────────────────────────┐
│              OpenClaw ACP Architecture                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────┐│
│  │   OpenClaw  │◀────▶│  ACP Bridge │◀────▶│ Codex   ││
│  │   Gateway   │      │  (acpx)     │      │ Claude  ││
│  │             │      │             │      │ Gemini  ││
│  └─────────────┘      └─────────────┘      └─────────┘│
│        │                                               │
│        │ WebSocket                                     │
│        ▼                                               │
│  ┌─────────────┐                                       │
│  │   Client    │                                       │
│  │ (Discord/   │                                       │
│  │  Telegram)  │                                       │
│  └─────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 ACP 会话类型

OpenClaw 支持两种 ACP 会话模式：

| 模式 | 描述 | 使用场景 |
|------|------|---------|
| `run` | 一次性执行，完成后自动关闭 | 简单任务，无需上下文保持 |
| `session` | 持久会话，支持多轮对话 | 复杂任务，需要持续交互 |

### 3.3 配置 ACP 智能体

**基本配置：**

```json5
{
  agents: {
    list: [
      {
        id: "codex",
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            backend: "acpx",
            mode: "persistent",
            cwd: "/workspace/project"
          }
        }
      },
      {
        id: "claude",
        runtime: {
          type: "acp",
          acp: {
            agent: "claude",
            backend: "acpx",
            mode: "persistent"
          }
        }
      }
    ]
  }
}
```

**绑定配置：**

```json5
{
  bindings: [
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "discord",
        accountId: "default",
        peer: { kind: "channel", id: "CODING_CHANNEL_ID" }
      },
      acp: {
        label: "codex-main",
        mode: "persistent"
      }
    }
  ]
}
```

### 3.4 ACP 操作命令

**快速操作流：**

```bash
# 1. 生成 ACP 会话
/acp spawn codex --mode persistent --thread auto

# 2. 在绑定的线程中工作
# （直接发送消息到线程）

# 3. 检查运行时状态
/acp status

# 4. 调整运行时选项
/acp model gpt-4o
/acp permissions relaxed
/acp timeout 1800

# 5. 引导活动会话
/acp steer "优化错误处理逻辑"

# 6. 停止工作
/acp cancel  # 停止当前回合
/acp close   # 关闭会话并移除绑定
```

### 3.5 工具调用：sessions_spawn

**启动 ACP 会话：**

```json
{
  "task": "打开仓库并总结失败的测试",
  "runtime": "acp",
  "agentId": "codex",
  "thread": true,
  "mode": "session"
}
```

**恢复现有会话：**

```json
{
  "task": "继续之前的工作 - 修复剩余的测试失败",
  "runtime": "acp",
  "agentId": "codex",
  "resumeSessionId": "previous-session-id"
}
```

**参数说明：**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `task` | string | 是 | 初始提示词 |
| `runtime` | string | 是 | 必须为 `"acp"` |
| `agentId` | string | 否 | ACP 目标工具 ID |
| `thread` | boolean | 否 | 请求线程绑定 |
| `mode` | string | 否 | `run` 或 `session` |
| `cwd` | string | 否 | 工作目录 |
| `label` | string | 否 | 会话标签 |
| `resumeSessionId` | string | 否 | 恢复已有会话 |

---

## 四、与 Claude Code 的集成

### 4.1 Claude Code 概述

Claude Code 是 Anthropic 推出的智能编码助手，通过 ACP 协议可以与 OpenClaw 集成。

**特性：**

- 深度代码理解和分析
- 支持大型代码库（200K+ tokens）
- 强大的推理和规划能力
- 安全的代码执行环境

### 4.2 集成配置

**安装 Claude Code：**

```bash
# 通过 npm 安装
npm install -g @anthropic/claude-code

# 或通过官方安装脚本
curl -sSL https://claude.ai/install.sh | bash
```

**OpenClaw 配置：**

```json5
{
  agents: {
    list: [
      {
        id: "claude-code",
        runtime: {
          type: "acp",
          acp: {
            agent: "claude",
            backend: "acpx",
            mode: "persistent",
            cwd: "/workspace"
          }
        },
        // Claude Code 特定配置
        permissions: {
          elevated: false,  // 禁用提权操作
          sandbox: true     // 启用沙盒
        }
      }
    ]
  }
}
```

### 4.3 使用场景示例

**代码重构：**

```
用户: @claude-code 重构这个模块，提高可测试性

Claude: 我将分析当前模块的结构，并提出重构建议...

[分析代码]
[生成重构方案]
[执行重构]

完成！主要改动：
1. 提取接口，解耦依赖
2. 引入依赖注入
3. 添加单元测试
```

**Bug 修复：**

```
用户: @claude-code 修复这个竞态条件

Claude: 正在分析并发问题...

[定位问题]
[生成修复方案]
[验证修复]

已修复：在 setup hook 中添加 await，防止读取过期状态
```

---

## 五、与 Codex 的集成

### 5.1 Codex 概述

Codex 是 OpenAI 的代码生成模型，通过 CLI 工具提供编码辅助功能。

**特性：**

- 快速代码生成
- 多语言支持
- 实时流式输出
- 与 OpenAI API 深度集成

### 5.2 集成配置

**安装 Codex CLI：**

```bash
# 通过 npm 安装
npm install -g @openai/codex

# 配置 API 密钥
codex config set apiKey <your-openai-api-key>
```

**OpenClaw 配置：**

```json5
{
  agents: {
    list: [
      {
        id: "codex",
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            backend: "acpx",
            mode: "persistent",
            cwd: "/workspace"
          }
        }
      }
    ]
  },
  bindings: [
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "discord",
        peer: { kind: "channel", id: "CODING_CHANNEL" }
      }
    }
  ]
}
```

### 5.3 使用场景示例

**快速原型开发：**

```
用户: @codex 创建一个 REST API，支持用户 CRUD

Codex: 生成 Express.js REST API...

[生成代码]
- routes/users.js
- models/user.js
- controllers/userController.js
- middleware/validation.js

运行 npm install 和 npm start 启动服务
```

**测试生成：**

```
用户: @codex 为 auth.js 生成单元测试

Codex: 使用 Jest 生成测试...

[生成测试代码]
- tests/auth.test.js
- 覆盖率: 95%

运行 npm test 执行测试
```

---

## 六、spawn、steer、kill 操作详解

### 6.1 spawn - 生成智能体

**功能：** 创建新的 ACP 或子智能体会话

**命令格式：**

```bash
# ACP spawn
/acp spawn <agent-id> [--mode <mode>] [--thread <auto|true|false>]

# Subagent spawn
/subagents spawn <task> [--model <model>] [--thinking <level>]
```

**工作流程：**

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ OpenClaw│────▶│  ACP    │────▶│  Agent  │
│ Request │     │ Gateway │     │ Bridge  │     │(Codex/  │
└─────────┘     └─────────┘     └─────────┘     │ Claude) │
     │                │                │        └─────────┘
     │                │                │              │
     │                │                │              ▼
     │                │                │        ┌─────────┐
     │                │                │        │ Session │
     │                │                │        │ Created │
     │                │                │        └─────────┘
     │                │                │              │
     │                │◄───────────────┴──────────────┘
     │                │        Session ID
     │◄───────────────┘
     │   Spawn Confirmed
     ▼
┌─────────┐
│ Thread  │
│ Bound   │
└─────────┘
```

**代码示例：**

```javascript
// 生成 Codex 会话处理任务
const result = await sessions_spawn({
  task: "实现用户认证模块",
  runtime: "acp",
  agentId: "codex",
  mode: "session",
  thread: true,
  label: "auth-implementation"
});

console.log(`会话已创建: ${result.sessionId}`);
```

### 6.2 steer - 引导智能体

**功能：** 在不替换上下文的情况下调整活动会话的行为

**使用场景：**

- 微调智能体的处理方式
- 添加额外约束或要求
- 纠正偏离的方向

**命令格式：**

```bash
# ACP steer
/acp steer <message>

# Subagent steer
/subagents steer <id> <message>
```

**工作流程：**

```
Before Steer:
┌─────────────────────────────────┐
│ Agent is working on task...     │
│ [Progress: 60%]                 │
└─────────────────────────────────┘

Steer Command:
/acp steer "关注性能优化，特别是数据库查询"

After Steer:
┌─────────────────────────────────┐
│ Agent adjusts focus...          │
│ [Progress: 60% → 65%]           │
│ [New focus: DB optimization]    │
└─────────────────────────────────┘
```

**代码示例：**

```javascript
// 引导子智能体调整方向
await sessions_send({
  sessionId: "subagent-123",
  message: "steer",
  content: "优先处理内存泄漏问题，而不是功能添加"
});
```

### 6.3 kill - 终止智能体

**功能：** 终止特定的子智能体或 ACP 会话

**命令格式：**

```bash
# 终止特定子智能体
/subagents kill <id|#>

# 终止所有子智能体
/subagents kill all

# 取消当前 ACP 会话
/acp cancel

# 关闭 ACP 会话
/acp close
```

**级联终止：**

```
Depth 0: Main Agent
         └─ Subagent A (Depth 1)
            ├─ Subagent B (Depth 2)
            │   └─ Subagent C (Depth 3)
            └─ Subagent D (Depth 2)

Kill A:
┌─────────────────────────────────┐
│ Kill Subagent A                 │
│ ├─ Terminate Subagent B         │
│ │  └─ Terminate Subagent C      │
│ └─ Terminate Subagent D         │
│                                 │
│ All children killed recursively │
└─────────────────────────────────┘
```

**代码示例：**

```javascript
// 终止超时子智能体
await sessions_kill({
  sessionId: "subagent-timeout",
  reason: "Execution timeout"
});

// 终止所有子智能体
await sessions_kill({
  all: true,
  cascade: true
});
```

---

## 七、实践模式与最佳实践

### 7.1 智能体选择模式

**根据任务选择智能体：**

| 任务类型 | 推荐智能体 | 原因 |
|---------|-----------|------|
| 复杂架构设计 | Claude Code | 深度推理能力 |
| 快速原型开发 | Codex | 快速代码生成 |
| 代码审查 | Claude Code | 详细分析能力 |
| 测试生成 | Codex | 高效批量生成 |
| 安全审计 | Claude Code | 安全专业训练 |
| 性能优化 | Claude Code | 优化建议质量高 |

### 7.2 混合编排模式

**主从模式：**

```
┌─────────────────────────────────────────┐
│           Main Agent                    │
│     (OpenClaw Native)                   │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│Claude │ │ Codex │ │Gemini │
│(Design)│ │(Code) │ │(Test) │
└───────┘ └───────┘ └───────┘
```

**实现代码：**

```javascript
async function hybridWorkflow(requirements) {
  // 1. 使用 Claude Code 进行架构设计
  const design = await sessions_spawn({
    runtime: "acp",
    agentId: "claude",
    task: `设计系统架构: ${requirements}`,
    mode: "run"
  });
  
  // 2. 使用 Codex 生成代码
  const code = await sessions_spawn({
    runtime: "acp",
    agentId: "codex",
    task: `实现架构: ${design.output}`,
    mode: "run"
  });
  
  // 3. 使用 Gemini 生成测试
  const tests = await sessions_spawn({
    runtime: "acp",
    agentId: "gemini",
    task: `为代码生成测试: ${code.output}`,
    mode: "run"
  });
  
  return { design, code, tests };
}
```

### 7.3 会话管理最佳实践

**会话生命周期管理：**

```javascript
// 创建带标签的会话
const session = await sessions_spawn({
  runtime: "acp",
  agentId: "codex",
  task: "实现功能",
  label: "feature-xyz",  // 便于后续引用
  mode: "session"
});

// 后续通过标签恢复
await sessions_spawn({
  runtime: "acp",
  agentId: "codex",
  resumeSessionId: session.sessionId,
  task: "继续之前的工作"
});

// 完成后清理
await sessions_kill({ sessionId: session.sessionId });
```

**错误处理：**

```javascript
try {
  const result = await sessions_spawn({
    runtime: "acp",
    agentId: "codex",
    task: "复杂任务",
    runTimeoutSeconds: 300  // 5分钟超时
  });
} catch (error) {
  if (error.code === "TIMEOUT") {
    // 超时处理：保存进度，通知用户
    await saveCheckpoint();
    await notifyUser("任务超时，已保存进度");
  } else if (error.code === "AGENT_ERROR") {
    // 智能体错误：记录日志，尝试恢复
    await logError(error);
    await attemptRecovery();
  }
}
```

### 7.4 安全最佳实践

**权限控制：**

```json5
{
  agents: {
    list: [
      {
        id: "untrusted-acp",
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            mode: "run"  // 使用一次性模式，不保持状态
          }
        },
        permissions: {
          elevated: false,      // 禁止提权
          sandbox: true,        // 强制沙盒
          allowedTools: [       // 限制可用工具
            "read",
            "web_search"
          ],
          deniedTools: [
            "write",
            "exec",
            "message"
          ]
        }
      }
    ]
  }
}
```

**输入验证：**

```javascript
// 验证用户输入后再传递给 ACP
function validateInput(userInput) {
  // 检查敏感模式
  const forbiddenPatterns = [
    /rm\s+-rf/,
    />\s*\/etc/,
    /curl.*\|.*sh/
  ];
  
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(userInput)) {
      throw new Error("检测到潜在危险操作");
    }
  }
  
  return sanitize(userInput);
}
```

---

## 八、故障排查与调试

### 8.1 常见问题

**问题 1：ACP 会话无法启动**

```
症状：/acp spawn 命令无响应

排查步骤：
1. 检查 acpx 是否已安装
   which acpx
   
2. 验证目标智能体是否安装
   which codex
   which claude
   
3. 检查 OpenClaw 配置
   openclaw config get agents.list
   
4. 查看网关日志
   openclaw gateway logs --follow
```

**问题 2：会话恢复失败**

```
症状：resumeSessionId 提示会话不存在

可能原因：
- 会话已过期或被清理
- sessionId 拼写错误
- 会话属于不同的 agentId

解决方案：
1. 列出可用会话
   openclaw sessions list
   
2. 检查会话状态
   openclaw sessions info <session-id>
   
3. 创建新会话代替
```

**问题 3：工具调用被拒绝**

```
症状：智能体报告无法访问某些工具

排查步骤：
1. 检查智能体工具策略
   openclaw agents info <agent-id>
   
2. 验证权限配置
   cat ~/.openclaw/agents/<agent-id>/agent/config.json
   
3. 临时放宽限制（开发环境）
   /acp permissions relaxed
```

### 8.2 调试技巧

**启用详细日志：**

```bash
# ACP 桥接器详细日志
openclaw acp --verbose

# 网关详细日志
openclaw gateway start --log-level debug
```

**监控会话状态：**

```bash
# 实时查看所有会话
watch -n 1 'openclaw sessions list'

# 查看特定会话详情
openclaw sessions info <session-id> --verbose

# 导出会话转录用于分析
openclaw sessions export <session-id> > session.log
```

**网络诊断：**

```bash
# 检查 ACP 桥接器连接
openclaw acp status

# 测试与智能体的连接
curl -s http://localhost:acp-port/health

# 查看 WebSocket 连接状态
openclaw gateway status --connections
```

---

## 九、未来展望

### 9.1 ACP 协议演进

**即将推出的特性：**

- **多模态支持**：图像、音频、视频输入
- **工具市场**：标准化的工具发现和共享
- **智能体市场**：预配置智能体的分发
- **A2A 协议**：智能体间直接通信

### 9.2 生态系统发展

```
┌─────────────────────────────────────────────────────────┐
│              ACP Ecosystem 2026                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Editors:          Agents:          Tools:            │
│   ┌─────────┐       ┌─────────┐      ┌─────────┐      │
│   │ Zed     │       │ Claude  │      │ Filesystem      │
│   │ VSCode  │       │ Codex   │      │ Terminal        │
│   │ Neovim  │       │ Gemini  │      │ Browser         │
│   │ JetBrains│      │ Goose   │      │ Database        │
│   │ Marimo  │       │ Kimi    │      │ Git             │
│   └─────────┘       └─────────┘      └─────────┘      │
│                                                         │
│   Protocols:                                           │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│   │ ACP     │  │ MCP     │  │ A2A     │              │
│   │(Editor) │  │(Context)│  │(Agent)  │              │
│   └─────────┘  └─────────┘  └─────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.3 OpenClaw 的 ACP 路线图

**近期（2026 Q2）：**

- 完整的 ACP 1.0 规范支持
- 改进的会话恢复机制
- 更丰富的工具调用事件

**中期（2026 Q3-Q4）：**

- 多模态 ACP 会话
- 智能体市场集成
- A2A 协议实验性支持

**长期（2027+）：**

- 完全自主的智能体网络
- 跨平台智能体迁移
- 分布式智能体编排

---

## 十、总结

ACP 协议为 AI 智能体与编辑器的集成提供了一个开放、标准化的解决方案。通过本文的介绍，我们深入了解了：

1. **协议规范**：基于 JSON-RPC 2.0 的通信协议
2. **架构设计**：解耦智能体与编辑器的桥接模式
3. **工具集成**：与 Claude Code、Codex 等主流工具的集成方式
4. **生命周期管理**：spawn、steer、kill 等核心操作
5. **最佳实践**：安全、性能、调试等方面的建议

OpenClaw 的 ACP 实现为开发者提供了一个强大的平台，可以灵活地编排多个 AI 智能体，构建复杂的自动化工作流。随着 ACP 生态系统的不断发展，我们可以期待更多创新的应用场景和更强大的功能。

---

## 参考资源

- [ACP 官方规范](https://agentclientprotocol.com/)
- [OpenClaw ACP 文档](https://docs.openclaw.ai/tools/acp-agents)
- [Claude Code 文档](https://claude.ai/code)
- [Codex CLI 文档](https://github.com/openai/codex)
- [acpx GitHub](https://github.com/openclaw/acpx)
- [Zed ACP 集成](https://zed.dev/acp)
- [Goose ACP 指南](https://block.github.io/goose/docs/guides/acp-clients)
