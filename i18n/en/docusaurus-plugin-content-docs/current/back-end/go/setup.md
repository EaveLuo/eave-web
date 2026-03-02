---
sidebar_label: Environment Setup
sidebar_position: 2
---

# Development Environment Setup - From Installation to First Program

To do a good job, one must first sharpen one's tools. Let's set up the Go development environment!

## InboxTray Installing Go

### 1. Download Go

Visit the official website to download the appropriate version: https://go.dev/dl/

**Selection Guide:**
- Windows: `.msi` installer
- macOS: `.pkg` installer or `brew install go`
- Linux: `.tar.gz` archive

### 2. Installation Steps

#### Windows

1. Run the downloaded `.msi` file
2. Click "Next" all the way through
3. Default installation path: `C:\Program Files\Go`
4. Restart terminal after installation

#### macOS

```bash
# Method 1: Using Homebrew (recommended)
brew install go

# Method 2: Download installer
# Double-click the pkg file after downloading
```

#### Linux

```bash
# Download (using version 1.21 as example)
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz

# Extract to /usr/local
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz

# Add to PATH
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### 3. Verify Installation

```bash
go version
```

Output should look like:
```
go version go1.21.0 darwin/amd64
```

## HammerAndWrench Configure Development Environment

### 1. Set GOPATH (Optional for Go 1.11+)

Go 1.11+ introduced Go Modules, making GOPATH optional, but it's still worth understanding:

```bash
# Check current GOPATH
go env GOPATH

# Set GOPATH (optional)
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```

### 2. Configure Go Modules

Go Modules is Go's dependency management tool (similar to npm, pip):

```bash
# Enable Go Modules (default in Go 1.13+)
export GO111MODULE=on

# Configure mirror for faster downloads (China)
go env -w GOPROXY=https://goproxy.cn,direct
```

### 3. Choose an Editor

#### VS Code (Recommended)

1. Install VS Code
2. Install Go extension (search "Go", select Microsoft version)
3. Extension will auto-install necessary tools

**Pros:**
- Free and lightweight
- Rich plugin ecosystem
- Excellent Go support
- Built-in debugging

#### GoLand (JetBrains)

Professional IDE specifically for Go:

1. Download from https://www.jetbrains.com/go/
2. Install and activate (free for students)

**Pros:**
- Powerful refactoring
- Advanced debugging
- Database tools built-in
- Commercial support

**Cons:**
- Paid software (except for students/open source)
- Heavier resource usage

#### Vim/Neovim

For terminal enthusiasts:

```bash
# Install vim-go plugin
# Using vim-plug:
Plug 'fatih/vim-go', { 'do': ':GoUpdateBinaries' }
```

## Rocket First Go Program

### 1. Create Project Directory

```bash
mkdir hello-go
cd hello-go
go mod init hello-go
```

This creates `go.mod` file:
```
module hello-go

go 1.21
```

### 2. Write Code

Create `main.go`:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    fmt.Println("My first Go program!")
}
```

### 3. Run Program

```bash
# Run directly
go run main.go

# Or build and run
go build -o hello
./hello
```

Output:
```
Hello, World!
My first Go program!
```

## WhiteCheckMark Common Commands

### go run

Compile and run immediately (no binary generated):
```bash
go run main.go
```

### go build

Compile and generate executable:
```bash
go build              # Use module name as output
go build -o myapp     # Specify output name
```

### go test

Run tests:
```bash
go test ./...         # Test all packages
go test -v            # Verbose output
go test -cover        # Show coverage
```

### go get

Download dependencies:
```bash
go get github.com/gin-gonic/gin
go get -u ./...       # Update all dependencies
```

### go mod

Module management:
```bash
go mod init myapp     # Initialize module
go mod tidy           # Clean up dependencies
go mod download       # Download dependencies
go mod vendor         # Create vendor directory
```

### go fmt

Format code:
```bash
go fmt ./...          # Format all files
```

### go vet

Static analysis:
```bash
go vet ./...          # Check for issues
```

## LightBulb Best Practices

### 1. Project Structure

```
myproject/
├── go.mod           # Module definition
├── go.sum           # Dependency checksums
├── main.go          # Entry point
├── cmd/             # Command-line tools
│   └── server/
│       └── main.go
├── pkg/             # Public packages
│   └── utils/
│       └── helper.go
├── internal/        # Private packages
│   └── config/
│       └── config.go
└── api/             # API definitions
    └── api.proto
```

### 2. Version Management

Use `go.mod` to manage dependencies:

```go
module myproject

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/stretchr/testify v1.8.4
)
```

### 3. Environment Variables

Common environment variables:

```bash
# Go installation path
export GOROOT=/usr/local/go

# Workspace path
export GOPATH=$HOME/go

# Binary search path
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin

# Module proxy
export GOPROXY=https://goproxy.cn,direct

# Disable CGO (for static compilation)
export CGO_ENABLED=0
```

## Bug Common Issues

### 1. "go: command not found"

**Cause:** Go not in PATH

**Solution:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH=$PATH:/usr/local/go/bin
```

### 2. "cannot find main module"

**Cause:** Not in a Go module directory

**Solution:**
```bash
go mod init myproject
```

### 3. "connection refused" when downloading

**Cause:** Network issues or proxy needed

**Solution:**
```bash
# Set domestic mirror
go env -w GOPROXY=https://goproxy.cn,direct

# Or disable proxy
go env -w GOPROXY=direct
```

### 4. VS Code Tools Installation Failed

**Solution:**
```bash
# Manually install tools
go install golang.org/x/tools/gopls@latest
go install github.com/go-delve/delve/cmd/dlv@latest
```

## Target Next Steps

Now that your environment is ready:

1. **Learn Basics**
   - Variables and constants
   - Data types
   - Control flow

2. **Write Practice Programs**
   - Calculator
   - Todo list
   - File processor

3. **Explore Standard Library**
   - fmt, strings, strconv
   - os, io, bufio
   - net/http

4. **Build Real Projects**
   - Web server
   - CLI tool
   - API service

---

**Next Chapter**: [Variables and Constants](./变量与常量.md)

You will learn:
- Variable declaration styles
- Constants and iota
- Type inference
- Naming conventions
