---
sidebar_label: Go Modules
sidebar_position: 18
---

# Go Modules - Dependency Management

Go Modules is the official dependency management solution, introduced in Go 1.11 and standard since Go 1.13.

## 📦 Core Files

```
myproject/
├── go.mod          # Module definition
├── go.sum          # Dependency checksums
└── main.go
```

## 🔧 Common Commands

```bash
# Initialize module
go mod init github.com/user/project

# Add/update dependency
go get github.com/gin-gonic/gin

# Clean unused dependencies
go mod tidy

# Download dependencies
go mod download
```

## 📝 go.mod Structure

```go.mod
module github.com/user/project

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
)
```

## 📌 Semantic Versioning

`vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

## 💡 Best Practices

1. **Commit go.mod and go.sum**
2. **Use exact versions** for reproducibility
3. **Run `go mod tidy`** regularly
4. **Use `replace` for local development**

---

**Next**: [Testing](./测试.md)
