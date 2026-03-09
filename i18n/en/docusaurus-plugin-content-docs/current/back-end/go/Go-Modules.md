---
sidebar_label: Go Modules
sidebar_position: 18
date: 2026-02-28T20:48:21.000Z
tags:
  - Go
  - Backend
description: >-
  Go's official dependency management solution introduced in Go 1.11. Manages
  dependencies via go.mod and go.sum with semantic versioning. Includes common
  commands: init, get, tidy, download.
---

# Go Modules - Dependency Management

Go Modules is Go's official dependency management solution, introduced in Go 1.11 and became the standard in Go 1.13+.

## Package Core Files

```
myproject/
├── go.mod          # Module definition and dependency list
├── go.sum          # Dependency checksums
└── main.go
```

## HammerAndWrench Common Commands

```bash
# Initialize module
go mod init github.com/myuser/myproject

# Add/update dependency
go get github.com/gin-gonic/gin

# Clean unused dependencies
go mod tidy

# Download dependencies
go mod download
```

## Memo go.mod Structure

```go.mod
module github.com/myuser/myproject

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
)
```

## Pushpin Semantic Versioning

`vMajor.Minor.Patch`

```
v1.2.3
│ │ │
│ │ └─ Patch (bug fixes)
│ └─── Minor (new features)
└───── Major (breaking changes)
```

## Rocket Advanced Usage

### Upgrade Dependencies

```bash
# Upgrade to latest version
go get -u ./...

# Upgrade specific package
go get -u github.com/gin-gonic/gin

# Upgrade to specific version
go get github.com/gin-gonic/gin@v1.8.0
```

### Replace Directives

```go.mod
module myproject

go 1.21

require (
    github.com/some/package v1.0.0
)

replace github.com/some/package => ../local/package
```

### Exclude Versions

```go.mod
exclude (
    github.com/bad/package v1.2.0
)
```

## Warning Common Issues

### 1. "cannot find module"

**Cause:** Module not initialized or proxy issues

**Solution:**
```bash
go mod init myproject
go env -w GOPROXY=https://proxy.golang.org,direct
```

### 2. "checksum mismatch"

**Cause:** Corrupted go.sum

**Solution:**
```bash
rm go.sum
go mod tidy
```

### 3. Indirect Dependencies

```go.mod
require (
    github.com/gin-gonic/gin v1.9.1
    github.com/some/dep v1.0.0 // indirect
)
```

These are dependencies of your dependencies. Run `go mod tidy` to clean up.

## LightBulb Best Practices

### 1. Commit go.mod and go.sum

```bash
git add go.mod go.sum
git commit -m "Add dependencies"
```

### 2. Use Semantic Import Versioning

```go
import "github.com/user/pkg/v2"  // For v2+
```

### 3. Regular Updates

```bash
# Check for updates
go list -u -m all

# Update all
go get -u ./...
go mod tidy
```

### 4. Vendor for Reproducibility

```bash
# Create vendor directory
go mod vendor

# Build with vendor
go build -mod=vendor
```

## WhiteCheckMark Key Points Summary

- WhiteCheckMark Use `go mod init` to start a project
- WhiteCheckMark `go get` adds dependencies
- WhiteCheckMark `go mod tidy` cleans up
- WhiteCheckMark Commit both go.mod and go.sum
- WhiteCheckMark Use semantic versioning
- WhiteCheckMark Consider vendoring for CI/CD

---

**Next Chapter**: [Testing](./测试.md)

**Previous Chapter**: [Concurrency Patterns](./并发模式.md)
