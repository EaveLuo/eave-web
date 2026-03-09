---
sidebar_label: Go Modules
sidebar_position: 18
date: 2026-03-01T04:48:21+08:00
tags: [Go, 后端]
---
# Go Modules - 依赖管理

Go Modules 是 Go 官方的依赖管理解决方案，从 Go 1.11 引入，Go 1.13+ 成为标准。

## 📦 核心文件

```
myproject/
├── go.mod          # 模块定义和依赖列表
├── go.sum          # 依赖校验和
└── main.go
```

## 🔧 常用命令

```bash
# 初始化模块
go mod init github.com/myuser/myproject

# 添加/更新依赖
go get github.com/gin-gonic/gin

# 清理未使用的依赖
go mod tidy

# 下载依赖
go mod download
```

## 📝 go.mod 结构

```go.mod
module github.com/myuser/myproject

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
)
```

## 📌 语义化版本

`v主版本。次版本。修订版`

```
v1.2.3
│ │ │
│ │ └─ 修订版（bug 修复）
│ └─── 次版本（新功能）
└───── 主版本（不兼容变更）
```

---

**下一章**：[测试](./测试.md)

**上一章**：[Go Modules](./Go-Modules.md)
