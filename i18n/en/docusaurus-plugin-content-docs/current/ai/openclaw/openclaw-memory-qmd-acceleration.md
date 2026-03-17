---
sidebar_label: 'OpenClaw Memory Retrieval Acceleration: QMD Deep Dive'
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
  - Local Search
description: >-
  A deep dive into OpenClaw's QMD memory retrieval backend, exploring how the hybrid architecture of BM25 + vector search + LLM reranking achieves 10x retrieval efficiency improvements, and how to deploy this powerful memory system locally.
---

# OpenClaw Memory Retrieval Acceleration: QMD Deep Dive

> When your AI Agent has been running for weeks, you start noticing it becomes "forgetful"—not actually forgetting, but unable to find things. This article takes you deep into OpenClaw's QMD memory backend to see how it solves this tricky problem.

---

## That Frustrating Afternoon

Three weeks ago, I asked my OpenClaw Agent: "Which port did we decide to run the Gateway on last time?"

It searched through MEMORY.md and gave me three paragraphs about Kubernetes notes, a lunch preference record, and finally said "can't find relevant information."

But I knew that information was there—in some log from three weeks ago. I clearly remembered writing: "Decided to run the Gateway on the Mac Mini, port 18789, using Cloudflare Tunnel for external access."

The problem wasn't that the memory disappeared, but that **retrieval failed**.

This is the pain point of OpenClaw's default memory system: as logs accumulate, it becomes increasingly "nearsighted." It didn't miss it—it just couldn't pinpoint it. This is when QMD steps in.

---

## What is QMD? More Than Just Another Search Tool

**QMD** (Query Markup Documents) is a local search engine created by Tobi Lütke, founder of Shopify. But don't be fooled by the term "search engine"—it's more like a **memory exoskeleton** tailored for AI Agents.

```
┌─────────────────────────────────────────────────────────────┐
│                    QMD Core Capabilities                     │
├─────────────────────────────────────────────────────────────┤
│  🔍 BM25 Full-Text Search  →  Precise keyword/code/ID match │
│  🧠 Vector Semantic Search →  Understands concept similarity│
│  🎯 LLM Reranking          →  Intelligent relevance scoring │
│  💻 Fully Local Execution  →  Zero API cost, zero privacy   │
└─────────────────────────────────────────────────────────────┘
```

Traditional memory retrieval is like using keywords to find books in a library, while QMD is more like having an **assistant who has actually read all the books**—you describe what you want, and they hand you the most relevant pages directly.

---

## Three-Stage Hybrid Search: Why 1+1+1 > 3

QMD's secret weapon is its **hybrid search pipeline**. This isn't simply "combining several search methods"—it's a carefully designed relay race.

### Stage 1: BM25 — Fast and Precise Keyword Matching

BM25 is a veteran in information retrieval, calculating relevance based on term frequency and inverse document frequency. Simply put, it excels at finding documents that **contain your search terms**.

```
Search: "SwiftUI navigation"
↓
BM25 finds:
  ✓ "SwiftUI NavigationStack Usage Guide"
  ✓ "Handling SwiftUI Page Navigation"
  ✗ "iOS Routing Best Practices"  ←  miss! Wrong words
```

**Pros**: Fast, accurate, especially effective for code and error messages  
**Cons**: Misses content with different wording

### Stage 2: Vector Search — Understanding "Similar Meaning"

QMD uses the Jina v3 embedding model (about 300MB in GGUF format) to convert text into 1024-dimensional vectors. Semantically similar content clusters together in vector space, regardless of word choice.

```
Search: "iOS routing"
↓
Vector search finds:
  ✓ "SwiftUI NavigationStack Usage Guide"
  ✓ "Handling SwiftUI Page Navigation"  
  ✓ "iOS Routing Best Practices"  ←  What BM25 missed, vectors caught!
```

**Pros**: Understands semantics, not afraid of rephrasing  
**Cons**: May "over-associate" with proper nouns and code snippets

### Stage 3: LLM Reranking — Final Quality Gate

This is QMD's killer feature. The first two stages each select 10 candidates, merge them using RRF (Reciprocal Rank Fusion), then feed them to a locally running reranking model (Qwen3 0.6B).

This model asks itself: "Given the query 'Ray's SwiftUI style,' which snippet actually answers this question?"

```
Candidate A: "Ray likes MVVM architecture, hates Massive View Controller"
Candidate B: "SwiftUI is Apple's declarative UI framework..."

Reranking model judges:
  A relevance: 95%  ✓  Directly answers style preference
  B relevance: 20%  ✗  Just introduces what SwiftUI is
```

**Result**: Returns the top 6 most relevant snippets, each up to 700 characters.

---

## Architecture Diagram: How Data Flows Through QMD

```
                    ┌─────────────────┐
                    │  User Query     │
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
                  │   Merge + Deduplicate│
                  └────────┬──────────┘
                           │
                  ┌────────┴────────┐
                  │  Top 30 Candidates│
                  └────────┬────────┘
                           │
                  ┌────────┴────────┐
                  │  LLM Reranker   │
                  │  (Qwen3 0.6B)   │
                  └────────┬────────┘
                           │
                  ┌────────┴────────┐
                  │  Final Top 6    │
                  │  (≤700 chars)   │
                  └─────────────────┘
```

The brilliance of this pipeline lies in **complementary stages**.

- BM25 ensures **exact matches** aren't missed
- Vector search captures **semantic associations**
- The reranking model provides **final quality control**

Like a multi-round interview process: HR screening (BM25) → Technical interview (vector) → Director final round (reranking).

---

## OpenClaw Integration: Configuration is Simpler Than You Think

Integrating QMD into OpenClaw takes just three steps:

### Step 1: Install QMD

```bash
# Recommended: use Bun for faster speed
bun install -g https://github.com/tobi/qmd

# Or npm
npm install -g @tobilu/qmd

# Verify installation
qmd --version
# Expected: qmd 0.4.2 or higher
```

**Note**: macOS users need to install SQLite first:
```bash
brew install sqlite
```

### Step 2: Configure OpenClaw

Edit your OpenClaw config file (usually at `~/.openclaw/config.json`):

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

**Configuration Reference**:

| Parameter | Meaning | Recommended |
|-----------|---------|-------------|
| `backend` | Memory backend type | `"qmd"` |
| `citations` | Auto-add source citations | `"auto"` |
| `interval` | Re-index interval | `"5m"` (5 minutes) |
| `waitForBootSync` | Wait for indexing on boot | `false` (background refresh) |
| `maxResults` | Number of results to return | `6` |
| `maxChars` | Max characters per snippet | `700` |

### Step 3: Restart OpenClaw

```bash
openclaw gateway restart
```

On first startup, QMD will automatically download three GGUF models (about 2GB total):

| Model | Purpose | Size |
|-------|---------|------|
| `embedding-gemma-300M` | Text embeddings | ~300MB |
| `qwen3-reranker-0.6b` | Result reranking | ~640MB |
| `qmd-query-expansion-1.7B` | Query expansion | ~1.1GB |

After downloading, OpenClaw will start indexing your memory files. Depending on memory volume, initial indexing may take 30-60 seconds.

---

## Performance Comparison: Numbers Don't Lie

I ran a simple comparison test using the same 50 memory logs, testing three configurations:

```
Test Scenario: Search for "Gateway port configuration" in 50 memory logs

┌─────────────────┬──────────────┬──────────────┬──────────────┐
│     Metric      │ Default SQLite│ SQLite Hybrid│     QMD      │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Relevant found  │     1/5      │     3/5      │     5/5      │
│ Top result quality│    Low      │   Medium     │    High      │
│ Avg response    │    ~50ms     │   ~100ms     │   ~800ms     │
│ First query     │    ~50ms     │   ~100ms     │   ~3s*       │
│ Local execution │      ✓       │      ✓       │      ✓       │
│ Extra install   │      ✗       │      ✗       │      ✓       │
└─────────────────┴──────────────┴──────────────┴──────────────┘

* QMD first query needs to load models into VRAM, subsequent queries ~800ms
```

**Interpretation**:

- **Default SQLite**: Fastest but lowest recall. Good for small memory volumes, latency-sensitive scenarios.
- **SQLite Hybrid**: Balanced choice, no extra installation needed, significantly improved recall.
- **QMD**: Highest recall, handles complex semantic queries, costs first-time loading and slightly higher latency.

**My recommendations**:
- Just started with OpenClaw, less than 10 memory files → Default SQLite is sufficient
- Often find Agent "can't find" things → Upgrade to QMD
- Want a middle ground → Try SQLite Hybrid first

---

## Real Scenarios: When QMD Saved Me

### Scenario 1: Code Decision Tracing

Three weeks ago decided to use port `18789` for Gateway, noted casually in logs. Later asked Agent: "Which port is Gateway running on?"

- **Default SQLite**: Returned three Kubernetes notes, said not found
- **QMD**: Directly located the "port 18789, Cloudflare Tunnel" entry

**Why it worked**: The word "port" appeared in the original text, BM25 caught it; vector search understood the semantic association between "Gateway" and "running."

### Scenario 2: Fuzzy Concept Matching

Asked: "What was that solution for preventing duplicate requests?"

Original text: "Decided to use idempotency key to handle duplicate clicks in form submission"

- **Default SQLite**: Search for "prevent duplicate" finds nothing (those four words don't appear in original)
- **QMD**: Vector search associates "prevent duplicate requests" with "idempotency key," successfully recalls

### Scenario 3: Multi-Condition Combination

Asked: "Ray's preferred SwiftUI architecture pattern"

Original text scattered in two places:
- "Ray likes MVVM architecture"
- "Ray hates Massive View Controller"

- **Default SQLite**: Returned a bunch of SwiftUI tutorial links
- **QMD**: Reranking model identifies first snippet directly answers "preferred architecture," second adds "style preference," both returned

---

## Costs and Trade-offs: No Free Lunch

QMD is powerful, but not a silver bullet. You need to weigh these costs:

### 1. Disk Space

Three GGUF models ~2GB, plus index files, reserve 3-5GB to be safe.

```
~/.openclaw/agents/main/qmd/
├── cache/
│   ├── embedding-gemma-300M-v1.gguf      # ~300MB
│   ├── qwen3-reranker-0.6b-v1.gguf       # ~640MB
│   └── qmd-query-expansion-1.7B-v1.gguf  # ~1.1GB
└── qmd.sqlite                             # Index file, varies by memory volume
```

### 2. Memory Usage

Models stay resident in VRAM/memory after loading, ~4GB recommended.

```
Runtime memory usage:
- Embedding model: ~300MB
- Reranking model: ~640MB
- Query expansion model: ~1.1GB
- Working memory: ~500MB
─────────────────────
Total: ~2.5GB (after initial load)
```

### 3. Query Latency

- First query: ~3 seconds (model loading)
- Subsequent queries: ~800ms
- Compare to default SQLite: ~50ms

**Optimization**: If latency-sensitive, enable HTTP MCP mode to keep models resident:

```bash
# Background resident mode
qmd mcp --http --daemon
```

### 4. Index Updates

Re-indexes every 5 minutes by default. If you just wrote new memory, may need to wait a few minutes to search.

---

## Advanced Tips: Making QMD Understand Your Memory Better

### Tip 1: Add Context to Collections

QMD supports adding descriptive context to collections, helping the reranking model understand document background:

```bash
# Add collection
qmd collection add ~/.openclaw/agents/main/memory --name agent-memory

# Add context (this step is important!)
qmd context add qmd://agent-memory "OpenClaw Agent memory logs, containing daily conversations, technical decisions, and personal preferences"
```

**Effect**: When you search for "that solution," the reranking model knows this is in the context of technical decisions, not what to have for lunch.

### Tip 2: Use Query Mode Selection

QMD provides three query methods, choose based on scenario:

```bash
# Fast keyword search - good for code, IDs, error messages
qmd search "ECONNREFUSED 18789"

# Pure vector search - good for fuzzy concepts
qmd vsearch "that thing for preventing duplicate submission"

# Hybrid search + reranking - most accurate, slightly slower
qmd query "Gateway deployment solution"
```

In OpenClaw, default uses `query` (hybrid search), you can also adjust in config:

```json
{
  "qmd": {
    "searchMode": "query"
  }
}
```

### Tip 3: Export Results for Agent Processing

Sometimes you want the Agent to decide how to handle search results:

```bash
# JSON format output
qmd query "authentication flow" --json -n 10

# Output file list only
qmd query "error handling" --all --files --min-score 0.4

# Get full document content
qmd get "docs/api-reference.md" --full
```

---

## Troubleshooting: Common Issues Quick Reference

### Q: QMD reports "SQLite extension not loaded" on startup

**A**: macOS built-in SQLite doesn't support extensions. Install Homebrew version:
```bash
brew install sqlite
export PATH="/opt/homebrew/opt/sqlite/bin:$PATH"
```

### Q: First query is very slow (10+ seconds)

**A**: Models are downloading or loading into VRAM. Check network connection, or manually preload:
```bash
qmd embed --collection agent-memory
```

### Q: Search results include deleted files

**A**: Index hasn't updated automatically. Manual refresh:
```bash
qmd update --collection agent-memory
qmd embed --collection agent-memory
```

### Q: OpenClaw stuck at "Initializing QMD" on startup

**A**: Check if QMD binary is in PATH:
```bash
which qmd
# If empty, add Bun/NPM global path
export PATH="$HOME/.bun/bin:$PATH"
```

---

## Final Thoughts: Memory is the Soul of an Agent

Using OpenClaw over this period, I've increasingly felt that **the quality of the memory system directly determines the IQ ceiling of an Agent**.

It's not that the model isn't smart enough—it's that it can't see what it should see. Like letting a genius take an exam but only giving them randomly opened textbook pages—no matter how talented, they can't perform.

QMD solves exactly this problem. It lets your Agent **truly remember** your conversations, decisions made, and rapport developed. This improvement in "memory" experience far outweighs switching to a larger model.

Of course, there are costs—disk space, memory usage, query latency. But for me, when the Agent can accurately recall a technical decision from three weeks ago, these costs are worth it.

After all, who doesn't want an AI assistant that **actually remembers what you said**?

---

## References

- [QMD GitHub Repository](https://github.com/tobi/qmd) - Official documentation and source code
- [OpenClaw Memory Documentation](https://docs.openclaw.ai/concepts/memory) - Official memory system documentation
- [OpenClaw QMD Practical Guide](https://dev.to/chwu1946/openclaw-qmd-local-hybrid-search-for-10x-smarter-memory-4m8m) - Community practical sharing
- [Fix OpenClaw Memory with QMD](https://www.josecasanova.com/blog/openclaw-qmd-memory) - Detailed configuration tutorial

---

*This article is based on OpenClaw v0.x and QMD v0.4.x. Configuration details may change with version updates—please refer to official documentation for the latest information.*