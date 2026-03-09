---
sidebar_label: Goroutines
sidebar_position: 14
date: 2026-02-27T00:39:30.000Z
tags:
  - Go
  - Backend
---

# Goroutines - Lightweight Concurrency

Goroutines are the foundation of Go's concurrency model. They're lightweight threads managed by the Go runtime.

## 🚀 What is a Goroutine?

A goroutine is a function that runs concurrently with other functions.

```go
// Start a goroutine with 'go' keyword
go sayHello()

func sayHello() {
    fmt.Println("Hello from goroutine!")
}
```

## 💡 Key Characteristics

| Feature | Goroutine | OS Thread |
|---------|-----------|-----------|
| Size | ~2KB stack | ~1MB stack |
| Creation | Cheap | Expensive |
| Switching | Fast | Slow |
| Number | Millions possible | Thousands typical |

## 📝 Basic Usage

### Starting Goroutines

```go
func main() {
    // Start multiple goroutines
    go printNumbers()
    go printLetters()
    
    // Wait for them to finish
    time.Sleep(time.Second)
}

func printNumbers() {
    for i := 1; i <= 5; i++ {
        fmt.Printf("%d ", i)
        time.Sleep(100 * time.Millisecond)
    }
}

func printLetters() {
    for c := 'a'; c <= 'e'; c++ {
        fmt.Printf("%c ", c)
        time.Sleep(100 * time.Millisecond)
    }
}
```

### Anonymous Function Goroutines

```go
go func() {
    fmt.Println("Anonymous goroutine")
}()

// With parameters
for i := 0; i < 3; i++ {
    go func(n int) {
        fmt.Printf("Goroutine %d\n", n)
    }(i)
}
```

⚠️ **Important:** Pass loop variables as arguments!

## ⏱️ Synchronization

### Using sync.WaitGroup

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()
        fmt.Printf("Worker %d done\n", n)
    }(i)
}

wg.Wait()  // Wait for all goroutines
fmt.Println("All done!")
```

## 🎯 Best Practices

1. **Don't leak goroutines** - Always ensure they exit
2. **Use channels for communication** - "Share memory by communicating"
3. **Limit concurrent goroutines** - Use worker pools for large tasks
4. **Handle panics** - Use defer/recover in long-running goroutines

---

**Next**: [Channels](./channel.md)
