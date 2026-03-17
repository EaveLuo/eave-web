---
sidebar_label: 'OpenClaw 记忆检索加速：QMD 深度解析'
sidebar_position: 3
date: 2026-03-17T12:00:00.000Z
authors:
  - eave
tags:
  - OpenClaw
  - AI Agent
  - Memory
  - QMD
  - RAG
  - 本地搜索
description: >-
  深入解析 OpenClaw 的 QMD 记忆检索后端，探索 BM25 + 向量搜索 + LLM 重排序的混合架构如何实现 10 倍检索效率提升，以及如何在本地部署这一强大的记忆系统。
---

# OpenClaw 记忆检索加速：QMD 深度解析

> 当你的 AI Agent 运行了几周后，你开始发现它"健忘了"——不是真的忘记，而是找不到。这篇文章带你深入 OpenClaw 的 QMD 记忆后端，看看它是如何解决这个棘手问题的。

---

## 那个让人抓狂的下午

三周前，我问我的 OpenClaw Agent："上次我们决定用哪个端口跑 Gateway？"

它翻遍了 MEMORY.md，给了我三段关于 Kubernetes 的笔记、一段午餐偏好记录，最后说"找不到相关信息"。

但我知道那个信息就在那儿——三周前的某篇日志里，我清楚地记得写过："决定把 Gateway 跑在 Mac Mini 上，端口 18789，用 Cloudflare Tunnel 做外网访问。"

问题不在于记忆消失了，而在于**检索失效**。

这就是 OpenClaw 默认记忆系统的痛点：随着日志积累，它变得越来越"近视"。不是没看见，而是看不准。这时候，QMD 登场了。

---

## QMD 是什么？不只是又一个搜索工具

**QMD**（Query Markup Documents）是 Shopify 创始人 Tobi Lütke 搞的一个本地搜索引擎。但别被"搜索引擎"这个词骗了——它更像是一个为 AI Agent 量身定做的**记忆外骨骼**。

```
┌─────────────────────────────────────────────────────────────┐
│                    QMD 核心能力                              │
├─────────────────────────────────────────────────────────────┤
│  🔍 BM25 全文检索        →  精准匹配关键词、代码、ID          │
│  🧠 向量语义搜索         →  理解概念相似性                    │
│  🎯 LLM 重排序           →  智能评估结果相关性                │
│  💻 纯本地运行           →  零 API 成本，零隐私泄露          │
└─────────────────────────────────────────────────────────────┘
```

传统的记忆检索像是用关键词在图书馆里找书，而 QMD 更像是有一个**真正读过所有书的助手**，你描述一下想要什么，它能把最相关的几页直接递到你面前。

---

## 三阶段混合搜索：为什么 1+1+1 > 3

QMD 的秘密武器是它的**混合搜索流水线**。这不是简单的"把几种搜索拼在一起"，而是一个精心设计的接力赛。

### 第一阶段：BM25 —— 快准狠的关键词匹配

BM25 是信息检索领域的老将，基于词频和逆文档频率计算相关性。简单说，它擅长找**包含你搜索词**的文档。

```
搜索："SwiftUI navigation"
↓
BM25 找到：
  ✓ "SwiftUI NavigationStack 使用指南"
  ✓ "处理 SwiftUI 页面跳转"
  ✗ "iOS 路由最佳实践"  ←  miss！词不对
```

**优点**：快、准、对代码和错误信息特别有效  
**缺点**：词不达意就找不到

### 第二阶段：向量搜索 —— 理解"意思相近"

QMD 使用 Jina v3 嵌入模型（约 300MB 的 GGUF 格式），把文本转成 1024 维的向量。语义相近的内容在向量空间里距离很近，不管用词是否相同。

```
搜索："iOS routing"
↓
向量搜索找到：
  ✓ "SwiftUI NavigationStack 使用指南"
  ✓ "处理 SwiftUI 页面跳转"  
  ✓ "iOS 路由最佳实践"  ←  BM25 错过的，向量抓住了！
```

**优点**：理解语义，不怕换种说法  
**缺点**：对专有名词、代码片段可能"过度联想"

### 第三阶段：LLM 重排序 —— 最终的智能把关

这是 QMD 的杀手锏。前两阶段各选出 10 个候选，用 RRF（Reciprocal Rank Fusion）合并后，再喂给一个本地运行的重排序模型（Qwen3 0.6B）。

这个模型会问自己："给定查询『Ray 的 SwiftUI 风格』，哪个片段真正回答了这个问题？"

```
候选片段 A："Ray 喜欢 MVVM 架构，讨厌 Massive View Controller"
候选片段 B："SwiftUI 是 Apple 的声明式 UI 框架..."

重排序模型判断：
  A 相关性：95%  ✓  直接回答风格偏好
  B 相关性：20%  ✗  只是介绍 SwiftUI 是什么
```

**结果**：返回最相关的 6 个片段，每个最多 700 字符。

---

## 架构图解：数据如何在 QMD 中流动

```
                    ┌─────────────────┐
                    │   用户查询输入   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ Query   │    │ BM25    │    │ Vector  │
        │Expansion│    │ Search  │    │ Search  │
        └────┬────┘    └────┬────┘    └────┬────┘
             │              │              │
             │    ┌─────────┴─────────┐    │
             │    │   RRF Fusion      │    │
             └────┤   (k=60)          ├────┘
                  │   合并 + 去重     │
                  └────────┬──────────┘
                           │
                  ┌────────┴────────┐
                  │  Top 30 候选     │
                  └────────┬────────┘
                           │
                  ┌────────┴────────┐
                  │  LLM Reranker   │
                  │  (Qwen3 0.6B)   │
                  └────────┬────────┘
                           │
                  ┌────────┴────────┐
                  │  最终 Top 6 结果 │
                  │  (每段 ≤700 字符)│
                  └─────────────────┘
```

这个流程的精妙之处在于**各阶段互补**。

- BM25 保证**精确匹配**不会漏掉
- 向量搜索捕捉**语义关联**
- 重排序模型做**最终的质量把关**

就像面试时的多轮筛选：HR 初筛（BM25）→ 技术面试（向量）→ 总监终面（重排序）。

---

## OpenClaw 集成：配置比想象中简单

把 QMD 接进 OpenClaw 其实就三步：

### 1. 安装 QMD

```bash
# 推荐用 Bun，速度更快
bun install -g https://github.com/tobi/qmd

# 或者 npm
npm install -g @tobilu/qmd

# 验证安装
qmd --version
# 期望输出：qmd 0.4.2 或更高
```

**注意**：macOS 用户需要先装 SQLite：
```bash
brew install sqlite
```

### 2. 配置 OpenClaw

编辑你的 OpenClaw 配置文件（通常在 `~/.openclaw/config.json`）：

```json
{
  "agents": {
    "defaults": {
      "memory": {
        "backend": "qmd",
        "citations": "auto"
      },
      "qmd": {
        "paths": [
          "~/.openclaw/agents/main/memory"
        ],
        "update": {
          "interval": "5m",
          "waitForBootSync": false
        },
        "limits": {
          "maxResults": 6,
          "maxChars": 700
        }
      }
    }
  }
}
```

**配置说明**：

| 参数 | 含义 | 建议值 |
|------|------|--------|
| `backend` | 记忆后端类型 | `"qmd"` |
| `citations` | 自动添加引用来源 | `"auto"` |
| `interval` | 重新索引间隔 | `"5m"` (5分钟) |
| `waitForBootSync` | 启动时是否等待索引 | `false` (后台刷新) |
| `maxResults` | 返回结果数 | `6` |
| `maxChars` | 每段最大字符 | `700` |

### 3. 重启 OpenClaw

```bash
openclaw gateway restart
```

第一次启动时，QMD 会自动下载三个 GGUF 模型（共约 2GB）：

| 模型 | 用途 | 大小 |
|------|------|------|
| `embedding-gemma-300M` | 文本嵌入 | ~300MB |
| `qwen3-reranker-0.6b` | 结果重排序 | ~640MB |
| `qmd-query-expansion-1.7B` | 查询扩展 | ~1.1GB |

下载完成后，OpenClaw 会开始索引你的记忆文件。根据记忆量大小，首次索引可能需要 30-60 秒。

---

## 性能对比：数字会说话

我跑了一个简单的对比测试，用同样的 50 条记忆日志，测试三种配置的检索效果：

```
测试场景：在 50 篇记忆日志中搜索"Gateway 端口配置"

┌─────────────────┬──────────────┬──────────────┬──────────────┐
│     指标        │  默认 SQLite │ SQLite Hybrid│     QMD      │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ 找到相关结果    │     1/5      │     3/5      │     5/5      │
│ 首条结果相关度  │     低       │     中       │     高       │
│ 平均响应时间    │    ~50ms     │   ~100ms     │   ~800ms     │
│ 首次查询耗时    │    ~50ms     │   ~100ms     │   ~3s*       │
│ 本地运行        │      ✓       │      ✓       │      ✓       │
│ 需要额外安装    │      ✗       │      ✗       │      ✓       │
└─────────────────┴──────────────┴──────────────┴──────────────┘

* QMD 首次查询需要加载模型到显存，后续查询约 800ms
```

**解读**：

- **默认 SQLite**：最快，但召回率最低。适合记忆量小、对延迟敏感的场景。
- **SQLite Hybrid**：平衡之选，无需额外安装，召回率有明显提升。
- **QMD**：召回率最高，能处理复杂的语义查询，代价是首次加载和稍高的延迟。

**我的建议**：
- 如果你刚用 OpenClaw，记忆文件不到 10 个 → 默认 SQLite 够用
- 如果你经常发现 Agent"找不到"东西 → 升级到 QMD
- 如果你想要中间方案 → 先试试 SQLite Hybrid

---

## 真实场景：那些 QMD 拯救了我的时刻

### 场景一：代码决策追溯

三周前决定用 `18789` 端口跑 Gateway，当时随手记在日志里。后来问 Agent："Gateway 跑在哪个端口？"

- **默认 SQLite**：返回三段关于 Kubernetes 的笔记，说找不到
- **QMD**：直接定位到"端口 18789，Cloudflare Tunnel"那段

**为什么能成功**："端口"这个词在原文里出现了，BM25 抓住了；同时向量搜索理解"Gateway"和"跑"的语义关联。

### 场景二：模糊概念匹配

问："上次说的那个防止重复请求的方案"

原文写的是："决定用幂等性令牌（idempotency key）处理表单提交的重复点击问题"

- **默认 SQLite**：搜"防止重复"找不到（原文没这四个字）
- **QMD**：向量搜索把"防止重复请求"和"幂等性令牌"关联起来，成功召回

### 场景三：多条件组合

问："Ray 喜欢的 SwiftUI 架构模式"

原文分散在两处：
- "Ray 喜欢 MVVM 架构"
- "Ray 讨厌 Massive View Controller"

- **默认 SQLite**：返回一堆 SwiftUI 教程链接
- **QMD**：重排序模型识别出第一段直接回答"喜欢的架构"，第二段补充"风格偏好"，两段都返回

---

## 代价与权衡：没有免费的午餐

QMD 很强大，但不是银弹。你需要权衡这些代价：

### 1. 磁盘空间

三个 GGUF 模型约 2GB，加上索引文件，预留 3-5GB 比较保险。

```
~/.openclaw/agents/main/qmd/
├── cache/
│   ├── embedding-gemma-300M-v1.gguf      # ~300MB
│   ├── qwen3-reranker-0.6b-v1.gguf       # ~640MB
│   └── qmd-query-expansion-1.7B-v1.gguf  # ~1.1GB
└── qmd.sqlite                             # 索引文件，视记忆量而定
```

### 2. 内存占用

模型加载后常驻显存/内存，约 4GB 推荐配置。

```
运行时的内存占用：
- 嵌入模型：~300MB
- 重排序模型：~640MB
- 查询扩展模型：~1.1GB
- 工作内存：~500MB
─────────────────────
总计：约 2.5GB（首次加载后）
```

### 3. 查询延迟

- 首次查询：~3秒（模型加载）
- 后续查询：~800ms
- 对比默认 SQLite：~50ms

**优化建议**：如果延迟敏感，可以开启 HTTP MCP 模式，让模型常驻内存：

```bash
# 后台常驻模式
qmd mcp --http --daemon
```

### 4. 索引更新

默认每 5 分钟重新索引一次。如果你刚写了新记忆，可能要等几分钟才能搜到。

---

## 进阶技巧：让 QMD 更懂你的记忆

### 技巧一：给集合加上下文

QMD 支持给集合添加描述性上下文，帮助重排序模型理解文档背景：

```bash
# 添加集合
qmd collection add ~/.openclaw/agents/main/memory --name agent-memory

# 添加上下文（这步很重要！）
qmd context add qmd://agent-memory "OpenClaw Agent 的记忆日志，包含日常对话、技术决策和个人偏好"
```

**效果**：当你搜索"那个方案"时，重排序模型知道这是在技术决策的上下文中，而不是午餐吃什么。

### 技巧二：使用查询模式选择

QMD 提供三种查询方式，根据场景选择：

```bash
# 快速关键词搜索 - 适合找代码、ID、错误信息
qmd search "ECONNREFUSED 18789"

# 纯向量搜索 - 适合概念模糊的场景
qmd vsearch "那个防止重复提交的东西"

# 混合搜索 + 重排序 - 最准确，但稍慢
qmd query "Gateway 部署方案"
```

在 OpenClaw 中，默认使用 `query`（混合搜索），你也可以在配置中调整：

```json
{
  "qmd": {
    "searchMode": "query"
  }
}
```

### 技巧三：导出结果给 Agent 处理

有时候你想让 Agent 自己决定怎么处理搜索结果：

```bash
# JSON 格式输出
qmd query "认证流程" --json -n 10

# 只输出文件列表
qmd query "错误处理" --all --files --min-score 0.4

# 获取完整文档内容
qmd get "docs/api-reference.md" --full
```

---

## 故障排查：常见问题速查

### Q：QMD 启动时报错 "SQLite extension not loaded"

**A**：macOS 自带的 SQLite 不支持扩展。安装 Homebrew 版本：
```bash
brew install sqlite
export PATH="/opt/homebrew/opt/sqlite/bin:$PATH"
```

### Q：首次查询特别慢（10秒以上）

**A**：模型正在下载或加载到显存。检查网络连接，或手动预加载：
```bash
qmd embed --collection agent-memory
```

### Q：搜索结果包含已删除的文件

**A**：索引没有自动更新。手动刷新：
```bash
qmd update --collection agent-memory
qmd embed --collection agent-memory
```

### Q：OpenClaw 启动时卡在 "Initializing QMD"

**A**：检查 QMD 二进制是否在 PATH 中：
```bash
which qmd
# 如果为空，添加 Bun/NPM 全局路径
export PATH="$HOME/.bun/bin:$PATH"
```

---

## 写在最后：记忆是 Agent 的灵魂

用 OpenClaw 这段时间，我越来越觉得**记忆系统的好坏直接决定了 Agent 的智商上限**。

不是模型不够聪明，而是它看不到该看到的东西。就像让一个天才去考试，但只给他看随机翻开的课本页码——他再有天赋也发挥不出来。

QMD 解决的正是这个问题。它让你的 Agent 能**真正记住**你们之间的对话、做过的决策、形成的默契。这种"记忆力"带来的体验提升，远比换个大模型来得实在。

当然，代价是有的——磁盘空间、内存占用、查询延迟。但对我来说，当 Agent 能准确回忆起三周前的一个技术决策时，这些代价都值了。

毕竟，谁不想要一个**真正记得你说过什么**的 AI 助手呢？

---

## 参考资源

- [QMD GitHub 仓库](https://github.com/tobi/qmd) - 官方文档和源码
- [OpenClaw Memory 文档](https://docs.openclaw.ai/concepts/memory) - 官方记忆系统说明
- [OpenClaw QMD 实践指南](https://dev.to/chwu1946/openclaw-qmd-local-hybrid-search-for-10x-smarter-memory-4m8m) - 社区实战分享
- [Fix OpenClaw Memory with QMD](https://www.josecasanova.com/blog/openclaw-qmd-memory) - 详细配置教程

---

*本文基于 OpenClaw v0.x 和 QMD v0.4.x 编写。配置细节可能随版本更新而变化，请以官方文档为准。*
