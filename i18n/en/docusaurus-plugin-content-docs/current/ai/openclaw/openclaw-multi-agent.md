---
title: OpenClaw Multi-Agent Architecture Deep Dive
description: Comprehensive analysis of OpenClaw's multi-agent system design, communication patterns, session management, and orchestration mechanisms
author: Eave
date: 2026-03-13
tags: [openclaw, multi-agent, architecture, ai]
category: ai
---

# OpenClaw Multi-Agent Architecture Deep Dive

## Overview

OpenClaw is an open-source AI agent orchestration framework designed to solve complex task scenarios through collaborative agent systems. Unlike traditional single-agent systems, OpenClaw adopts a **layered isolation and dynamic orchestration** design philosophy, allowing users to deploy multiple AI agents with independent identities, memories, and toolsets, with flexible binding mechanisms for message routing and task distribution.

This article explores the core architecture, communication patterns, session management mechanisms, and practical application scenarios of OpenClaw's multi-agent system, helping developers understand how to build scalable, secure, and efficient multi-agent applications.

---

## 1. Core Architecture Design

### 1.1 Agent Isolation Model

OpenClaw adopts a **complete agent isolation model**, where each Agent is an independent "brain" with the following isolated resources:

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

**Key Isolation Principles:**

- **Workspace Isolation**: Each agent has an independent working directory containing identity configuration files like `AGENTS.md`, `SOUL.md`, and `USER.md`
- **Auth Isolation**: `auth-profiles.json` is separated by agent to avoid credential conflicts
- **Session Isolation**: Sessions are stored under `~/.openclaw/agents/<agentId>/sessions`, completely independent across agents
- **Skill Isolation**: Each agent loads exclusive skills via the `skills/` directory, with shared skills available from `~/.openclaw/skills`

### 1.2 Single-Agent vs Multi-Agent Mode

**Single-Agent Mode (Default):**

```json5
// Default configuration, agentId = "main"
{
  agents: {
    list: [
      { id: "main", workspace: "~/.openclaw/workspace" }
    ]
  }
}
```

- Session key format: `agent:main:<mainKey>`
- Workspace: `~/.openclaw/workspace`
- State directory: `~/.openclaw/agents/main/agent`

**Multi-Agent Mode:**

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

- Supports multiple independent agents running in parallel
- Each agent can bind to different channel accounts
- Message routing rules configured via `bindings`

---

## 2. Message Routing and Binding Mechanisms

### 2.1 Bindings System

Bindings are the core mechanism for message routing in OpenClaw, determining how inbound messages are assigned to specific agents.

**Binding Matching Priority (High to Low):**

```
1. peer match (exact DM/group/channel ID)
2. parentPeer match (thread inheritance)
3. guildId + roles (Discord role routing)
4. guildId (Discord server)
5. teamId (Slack team)
6. accountId match (channel account)
7. channel-level match (accountId: "*")
8. default agent fallback
```

### 2.2 Configuration Examples

**Multi-WhatsApp Number Routing:**

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
        personal: { /* personal number config */ },
        business: { /* business number config */ }
      }
    }
  }
}
```

**Discord Multi-Bot Configuration:**

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

### 2.3 Routing Rules Details

**AND Semantics:**

When a binding sets multiple match fields (e.g., `peer` + `guildId`), all specified fields must match simultaneously.

**Account Scope Details:**

- Bindings omitting `accountId` only match the default account
- Use `accountId: "*"` for channel-level fallback across all accounts
- Later explicit account bindings upgrade existing channel-level bindings

---

## 3. Sub-Agents System

### 3.1 Sub-Agents Overview

Sub-agents are background agent instances spawned from an existing agent run, used for parallel task processing without blocking the main agent.

**Core Features:**

- Independent session: `agent:<agentId>:subagent:<uuid>`
- Announce results back to the requester channel upon completion
- Support nesting (configurable maximum depth)
- Default restricted tool policies

### 3.2 Session Key Hierarchy

```
Depth 0: agent:<id>:main              (Main Agent)
         └─ Can spawn sub-agents
            
Depth 1: agent:<id>:subagent:<uuid>   (Sub-agent)
         └─ Can spawn children if maxSpawnDepth: 2
            
Depth 2: agent:<id>:subagent:<uuid>   (Grandchild - Worker)
```

### 3.3 Sub-Agent Commands

**Slash Commands:**

```bash
# List all sub-agents for current session
/subagents list

# Kill specific sub-agent (cascades to children)
/subagents kill <id|#|all>

# View sub-agent logs
/subagents log <id|#> [limit] [tools]

# Get sub-agent metadata
/subagents info <id|#>

# Send message to sub-agent
/subagents send <id|#> <message>
# Steer/adjust sub-agent behavior
/subagents steer <id|#> <message>

# Manually spawn sub-agent
/subagents spawn <agentId> <task> [--model <model>] [--thinking <level>]
```

**Tool Invocation (sessions_spawn):**

```json
{
  "task": "Analyze codebase and find potential security vulnerabilities",
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

### 3.4 Nested Sub-Agent Configuration

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxSpawnDepth: 2,           // Allow sub-agents to spawn children (default: 1)
        maxChildrenPerAgent: 5,     // Max active children per agent session (default: 5)
        maxConcurrent: 8,           // Global concurrency lane cap (default: 8)
        runTimeoutSeconds: 900,     // Default timeout (0 = no timeout)
        archiveAfterMinutes: 60,    // Auto-archive time
        model: "gpt-4o-mini",       // Default sub-agent model
        thinking: "medium"          // Default thinking level
      }
    }
  }
}
```

### 3.5 Thread-Bound Sessions

Channels supporting thread bindings (currently Discord only):

```bash
# Bind thread to sub-agent session
/focus <subagent-label|session-key|session-id>

# Unbind
/unfocus

# List active runs and binding state
/agents

# Set idle timeout
/session idle <duration|off>

# Set max age
/session max-age <duration|off>
```

---

## 4. Session Management and Isolation

### 4.1 Session Types

OpenClaw supports multiple session types, each with specific use cases:

| Session Type | Session Key Format | Purpose |
|-------------|-------------------|---------|
| Main Session | `agent:<id>:main` | Primary user-agent interaction |
| Sub-agent Session | `agent:<id>:subagent:<uuid>` | Background task execution |
| ACP Session | `agent:<id>:acp:<uuid>` | External coding tool integration |
| DM Session | `agent:<id>:<channel>:dm:<identifier>` | Direct message isolation |
| Group Session | `agent:<id>:<channel>:group:<identifier>` | Group chat isolation |

### 4.2 Session Sandbox

Sessions are sandboxed by default to protect the host from untrusted inputs:

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
│  │         ↕  IPC / WebSocket      │    │
│  └─────────────────────────────────┘    │
│         ↕  Gateway API                  │
└─────────────────────────────────────────┘
```

**Sandbox Policies:**

- Relative paths resolve within the agent workspace
- Absolute paths can reach other host locations unless sandboxing is enabled
- Each agent can configure independent tool allow/deny policies
- Workspace access controls prevent context leakage between agents

### 4.3 Session Lifecycle

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Created │───▶│ Active  │───▶│ Paused  │───▶│ Resumed │───▶│Archived │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                    │                              ▲
                    └──────────────────────────────┘
                           (auto after idle)
```

**Auto-Archive Mechanism:**

- Sub-agent sessions auto-archive after `archiveAfterMinutes` (default 60 minutes)
- Archive uses `sessions.delete` and renames transcript to `*.deleted.<timestamp>`
- Auto-archive is best-effort; pending timers are lost if gateway restarts

---

## 5. Communication Patterns and Collaboration

### 5.1 Inter-Agent Communication

OpenClaw follows an **explicit over implicit** principle for inter-agent communication:

**Direct Communication (Not Recommended):**

Agents do not communicate directly with each other; instead, they coordinate through the main agent.

**Indirect Communication (Recommended):**

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

### 5.2 Orchestration Patterns

**Sequential Orchestration:**

```yaml
# Workflow definition example
steps:
  - name: research
    agent: researcher
    task: "Collect background information on the topic"
    
  - name: write
    agent: writer
    depends_on: [research]
    task: "Write article based on research findings"
    
  - name: review
    agent: reviewer
    depends_on: [write]
    task: "Review article quality"
```

**Parallel Orchestration:**

```yaml
steps:
  - name: analyze_code
    parallel:
      - agent: security_analyst
        task: "Security audit"
      - agent: performance_expert
        task: "Performance analysis"
      - agent: test_engineer
        task: "Test coverage check"
    aggregate: "synthesize_results"
```

**Hierarchical Orchestration:**

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

---

## 6. Practical Application Scenarios

### 6.1 Multi-Tenant Support System

**Scenario:**

An enterprise needs to deploy independent support agents for different product lines while maintaining unified gateway infrastructure.

**Architecture:**

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

**Benefits:**

- Each product line has independent memory and knowledge base
- Complete customer data isolation
- Independent updates for each agent's configuration and skills

### 6.2 Development Team Multi-Agent Pipeline

**Scenario:**

A software development team needs to automate code review, testing, and documentation generation.

**Implementation Code:**

```javascript
// Main agent coordinates development pipeline
async function devPipeline(codeChanges) {
  // Spawn multiple sub-agents in parallel
  const [review, security] = await Promise.all([
    sessions_spawn({
      task: `Review code changes: ${codeChanges}`,
      label: "code-review",
      model: "gpt-4o"
    }),
    sessions_spawn({
      task: `Security audit: ${codeChanges}`,
      label: "security-audit",
      model: "claude-3-opus"
    })
  ]);
  
  // Continue based on results
  if (review.approved && security.passed) {
    const [tests, docs] = await Promise.all([
      sessions_spawn({ task: "Run test suite", label: "test-runner" }),
      sessions_spawn({ task: "Update API docs", label: "docs-generator" })
    ]);
    
    return { review, security, tests, docs };
  }
}
```

### 6.3 Personal Multi-Agent Assistant

**Configuration Example:**

```json5
{
  agents: {
    list: [
      {
        id: "personal",
        workspace: "~/.openclaw/workspace-personal",
        default: true,
        description: "General personal assistant"
      },
      {
        id: "coding",
        workspace: "~/.openclaw/workspace-coding",
        description: "Programming expert",
        runtime: {
          type: "acp",
          acp: { agent: "codex", mode: "persistent" }
        }
      },
      {
        id: "writing",
        workspace: "~/.openclaw/workspace-writing",
        description: "Writing assistant"
      },
      {
        id: "research",
        workspace: "~/.openclaw/workspace-research",
        description: "Research analyst",
        subagents: {
          model: "gpt-4o",
          maxSpawnDepth: 2
        }
      }
    ]
  }
}
```

---

## 7. Best Practices

### 7.1 Agent Design Principles

**Single Responsibility Principle:**

Each agent should focus on one clear domain or task type.

```
❌ Anti-pattern: One agent handles programming, writing, and data analysis
✅ Pattern: coding-agent, writing-agent, analysis-agent separated
```

**Least Privilege Principle:**

```json5
{
  agents: {
    list: [
      {
        id: "restricted-agent",
        tools: {
          allow: ["read", "web_search"],  // Only allow read and search
          deny: ["write", "exec", "message"]  // Deny write and execute
        }
      }
    ]
  }
}
```

### 7.2 Performance Optimization

**Model Selection Strategy:**

```json5
{
  agents: {
    defaults: {
      model: "gpt-4o",  // Main agent uses high-quality model
      subagents: {
        model: "gpt-4o-mini",  // Sub-agents use cost-effective model
        thinking: "low"  // Reduce thinking depth to save tokens
      }
    }
  }
}
```

### 7.3 Security and Isolation

**Workspace Isolation Checklist:**

- [ ] Each agent uses independent `agentDir`
- [ ] Never reuse `agentDir` across agents
- [ ] Store sensitive credentials in `auth-profiles.json`
- [ ] Enable sandbox mode for untrusted inputs
- [ ] Configure tool allow/deny policies

---

## 8. Conclusion

OpenClaw's multi-agent architecture provides a powerful and flexible platform for building complex AI applications. Its core design principles include:

1. **Complete Isolation**: Each agent has independent workspace, authentication, and sessions
2. **Flexible Routing**: Fine-grained message distribution through binding mechanisms
3. **Hierarchical Orchestration**: Support for nested sub-agents enabling complex workflows
4. **Security First**: Default sandboxing and tool policy controls
5. **Scalability**: Seamless scaling from single agent to multi-agent clusters

By following the best practices outlined in this article, developers can build secure and efficient multi-agent systems that meet a wide range of needs from personal assistants to enterprise applications.

---

## References

- [OpenClaw Official Documentation](https://docs.openclaw.ai)
- [Multi-Agent Routing](https://docs.openclaw.ai/concepts/multi-agent)
- [Sub-Agents](https://docs.openclaw.ai/tools/subagents)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Agent Client Protocol](https://agentclientprotocol.com/)
