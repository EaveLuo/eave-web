---
title: ACP (Agent Collaboration Protocol) Deep Dive
description: >-
  In-depth understanding of ACP protocol specification, inter-agent
  communication mechanisms, and integration with Claude Code, Codex, and other
  tools
date: 2026-03-13T00:00:00.000Z
tags:
  - ai
  - openclaw
  - acp
  - agent-protocol
  - claude-code
  - codex
category: ai
authors:
  - eave
---

# ACP (Agent Collaboration Protocol) Deep Dive

## Overview

The Agent Collaboration Protocol (ACP) is an open standard designed to enable seamless integration between AI agents and editor environments. Initiated and open-sourced by Zed Industries, ACP solves the "three-app problem" in AI-assisted development—the pain point where developers need to constantly switch between their editor, AI agent, and browser.

This article explores ACP protocol specifications, architectural design, integration with mainstream coding tools (Claude Code, Codex, Gemini CLI, etc.), and practical applications in OpenClaw.

---

## 1. ACP Protocol Background and Motivation

### 1.1 The Three-App Problem

In traditional AI-assisted development workflows, developers face these challenges:

```
┌─────────────────────────────────────────────────────────┐
│                 Traditional Workflow                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐       │
│   │ Editor  │◀────▶│ AI Agent│◀────▶│ Browser │       │
│   │(VSCode) │      │(Claude) │      │(Preview)│       │
│   └─────────┘      └─────────┘      └─────────┘       │
│        ▲                ▲                ▲             │
│        └────────────────┴────────────────┘             │
│              Frequent context switching                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Main Pain Points:**

- **Insufficient screen space**: Three-way split makes each window too narrow
- **Context switching cost**: Frequent switching interrupts flow state
- **Difficult review**: Hard to view code changes and preview simultaneously
- **Complex window management**: Multi-window layouts are hard to maintain

### 1.2 ACP Solution

ACP achieves **decoupling of agents and editors** through a standardized protocol:

```
┌─────────────────────────────────────────────────────────┐
│                    ACP Workflow                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐         ACP Protocol         ┌─────────┐│
│   │  Zed    │◀────────────────────────────▶│ Claude  ││
│   │  Editor │      (JSON-RPC over stdio)   │  Code   ││
│   └─────────┘                              └─────────┘│
│        │                                        │      │
│        └────────────────────────────────────────┘      │
│              Unified protocol, arbitrary combinations   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Core Advantages:**

- **No vendor lock-in**: Any ACP-compatible editor + any ACP-compatible agent
- **Independent evolution**: Editors and agents can update independently
- **Write once, run anywhere**: Agents implement ACP once, support all compatible editors
- **Standardized interface**: Unified JSON-RPC communication protocol

---

## 2. ACP Protocol Specification

### 2.1 Protocol Architecture

ACP is built on **JSON-RPC 2.0**, using **request-response** and **notification** communication modes:

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

### 2.2 Core Message Types

**Session Management Messages:**

| Message Type | Direction | Description |
|-------------|-----------|-------------|
| `session/initialize` | Client → Server | Initialize session, exchange capabilities |
| `session/new` | Client → Server | Create new session |
| `session/load` | Client → Server | Load existing session |
| `session/prompt` | Client → Server | Send prompt |
| `session/cancel` | Client → Server | Cancel current operation |
| `session/update` | Server → Client | Send response updates |
| `session/complete` | Server → Client | Operation complete notification |

**Tool Call Messages:**

| Message Type | Direction | Description |
|-------------|-----------|-------------|
| `tool/call` | Server → Client | Request tool execution |
| `tool/result` | Client → Server | Return tool execution result |
| `tool/progress` | Client → Server | Tool execution progress update |

### 2.3 Session Lifecycle

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

---

## 3. ACP in OpenClaw

### 3.1 OpenClaw ACP Architecture

OpenClaw integrates with external coding tools through an ACP bridge:

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

### 3.2 ACP Session Types

OpenClaw supports two ACP session modes:

| Mode | Description | Use Case |
|------|------|---------|
| `run` | One-shot execution, auto-close on completion | Simple tasks, no context needed |
| `session` | Persistent session, supports multi-turn dialogue | Complex tasks requiring continuous interaction |

### 3.3 spawn, steer, kill Operations

**spawn - Spawn Agent:**

Creates new ACP or sub-agent session for parallel task processing.

```bash
# ACP spawn
/acp spawn <agent-id> [--mode <mode>] [--thread <auto|true|false>]

# Subagent spawn
/subagents spawn <task> [--model <model>] [--thinking <level>]
```

**steer - Guide Agent:**

Adjusts active session behavior without replacing context.

```bash
# ACP steer
/acp steer <message>

# Subagent steer
/subagents steer <id> <message>
```

**kill - Terminate Agent:**

Terminates specific sub-agent or ACP session.

```bash
# Kill specific sub-agent
/subagents kill <id|#>

# Kill all sub-agents
/subagents kill all

# Cancel current ACP session
/acp cancel

# Close ACP session
/acp close
```

### 3.4 Tool Invocation: sessions_spawn

**Launch ACP Session:**

```json
{
  "task": "Open repo and summarize failing tests",
  "runtime": "acp",
  "agentId": "codex",
  "thread": true,
  "mode": "session"
}
```

**Resume Existing Session:**

```json
{
  "task": "Continue where we left off - fix remaining test failures",
  "runtime": "acp",
  "agentId": "codex",
  "resumeSessionId": "previous-session-id"
}
```

---

## 4. Integration with Claude Code

### 4.1 Claude Code Overview

Claude Code is Anthropic's intelligent coding assistant, integrable with OpenClaw through ACP protocol.

**Features:**

- Deep code understanding and analysis
- Support for large codebases (200K+ tokens)
- Powerful reasoning and planning capabilities
- Secure code execution environment

### 4.2 Integration Configuration

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
        permissions: {
          elevated: false,
          sandbox: true
        }
      }
    ]
  }
}
```

---

## 5. Integration with Codex

### 5.1 Codex Overview

Codex is OpenAI's code generation model, providing coding assistance through CLI tools.

**Features:**

- Fast code generation
- Multi-language support
- Real-time streaming output
- Deep OpenAI API integration

### 5.2 Integration Configuration

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
  }
}
```

---

## 6. Best Practices

### 6.1 Agent Selection Pattern

**Choose agent based on task:**

| Task Type | Recommended Agent | Reason |
|---------|-----------|------|
| Complex architecture design | Claude Code | Deep reasoning capability |
| Rapid prototyping | Codex | Fast code generation |
| Code review | Claude Code | Detailed analysis |
| Test generation | Codex | Efficient batch generation |
| Security audit | Claude Code | Security-focused training |
| Performance optimization | Claude Code | High-quality optimization suggestions |

### 6.2 Session Management Best Practices

**Session Lifecycle Management:**

```javascript
// Create labeled session
const session = await sessions_spawn({
  runtime: "acp",
  agentId: "codex",
  task: "Implement feature",
  label: "feature-xyz",
  mode: "session"
});

// Resume by label
await sessions_spawn({
  runtime: "acp",
  agentId: "codex",
  resumeSessionId: session.sessionId,
  task: "Continue previous work"
});

// Cleanup when done
await sessions_kill({ sessionId: session.sessionId });
```

### 6.3 Security Best Practices

**Permission Control:**

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
            mode: "run"
          }
        },
        permissions: {
          elevated: false,
          sandbox: true,
          allowedTools: ["read", "web_search"],
          deniedTools: ["write", "exec", "message"]
        }
      }
    ]
  }
}
```

---

## 7. Conclusion

The ACP protocol provides an open, standardized solution for integrating AI agents with editors. Through this article, we gained deep understanding of:

1. **Protocol Specification**: JSON-RPC 2.0 based communication protocol
2. **Architecture Design**: Bridge pattern decoupling agents from editors
3. **Tool Integration**: Integration with mainstream tools like Claude Code and Codex
4. **Lifecycle Management**: Core operations like spawn, steer, kill
5. **Best Practices**: Recommendations for security, performance, and debugging

OpenClaw's ACP implementation provides developers with a powerful platform to flexibly orchestrate multiple AI agents and build complex automation workflows.

---

## References

- [ACP Official Specification](https://agentclientprotocol.com/)
- [OpenClaw ACP Documentation](https://docs.openclaw.ai/tools/acp-agents)
- [Claude Code Documentation](https://claude.ai/code)
- [Codex CLI Documentation](https://github.com/openai/codex)
- [acpx GitHub](https://github.com/openclaw/acpx)
- [Zed ACP Integration](https://zed.dev/acp)
