---
sidebar_label: Goroutines
sidebar_position: 14
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
| Stack Size | ~2KB (grows dynamically) | ~1MB (fixed) |
| Creation Cost | Cheap (~2μs) | Expensive (~100μs) |
| Context Switch | Fast | Slow |
| Max Count | Millions | Thousands |
| Managed By | Go Runtime | OS Kernel |

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
// Immediate execution
go func() {
    fmt.Println("Anonymous goroutine")
}()

// With parameters (IMPORTANT!)
for i := 0; i < 3; i++ {
    go func(n int) {
        fmt.Printf("Goroutine %d\n", n)
    }(i)  // Pass i as argument
}
```

⚠️ **Critical:** Always pass loop variables as arguments!

## ⏱️ Synchronization

### Using sync.WaitGroup

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()
        fmt.Printf("Worker %d done\n", n)
        time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)
    }(i)
}

wg.Wait()  // Wait for all goroutines
fmt.Println("All workers completed!")
```

### Using Channels

```go
done := make(chan bool)

go func() {
    work()
    done <- true
}()

<-done  // Block until goroutine finishes
```

## 🎯 Goroutine Scheduling

Go uses an M:N scheduling model:
- **M** goroutines mapped to **N** OS threads
- Go runtime manages scheduling (not OS)
- Work-stealing algorithm for load balancing

```
Goroutines (M)
     ↓
Go Scheduler
     ↓
OS Threads (N, typically = CPU cores)
     ↓
CPU Cores
```

## ⚠️ Common Pitfalls

### 1. Goroutine Leaks

```go
// ❌ Bad: Goroutine never exits
func leaky() {
    ch := make(chan int)
    go func() {
        for {  // Infinite loop!
            val := <-ch
            process(val)
        }
    }()
}

// ✅ Good: Provide exit signal
func clean(done chan struct{}) {
    go func() {
        for {
            select {
            case val := <-ch:
                process(val)
            case <-done:
                return  // Exit cleanly
            }
        }
    }()
}
```

### 2. Race Conditions

```go
// ❌ Dangerous: Concurrent access
counter := 0
for i := 0; i < 1000; i++ {
    go func() {
        counter++  // Race condition!
    }()
}

// ✅ Safe: Use synchronization
var mu sync.Mutex
for i := 0; i < 1000; i++ {
    go func() {
        mu.Lock()
        counter++
        mu.Unlock()
    }()
}
```

### 3. Blocking Main Goroutine

```go
// ❌ Program exits immediately
func main() {
    go longRunningTask()
    // main exits, program terminates
}

// ✅ Wait for completion
func main() {
    go longRunningTask()
    
    // Method 1: Sleep (not recommended)
    time.Sleep(5 * time.Second)
    
    // Method 2: Use sync.WaitGroup (recommended)
    var wg sync.WaitGroup
    wg.Add(1)
    go func() {
        defer wg.Done()
        longRunningTask()
    }()
    wg.Wait()
}
```

## 💡 Best Practices

### 1. Limit Concurrent Goroutines

```go
// Worker pool pattern
const maxWorkers = 10

func workerPool(jobs <-chan Job) {
    var wg sync.WaitGroup
    
    // Start limited workers
    for i := 0; i < maxWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for job := range jobs {
                process(job)
            }
        }(i)
    }
    
    wg.Wait()
}
```

### 2. Handle Panics

```go
func safeGoroutine(fn func()) {
    go func() {
        defer func() {
            if r := recover(); r != nil {
                log.Printf("Recovered from panic: %v", r)
            }
        }()
        fn()
    }()
}
```

### 3. Use Context for Cancellation

```go
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

go func(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            return
        default:
            doWork()
        }
    }
}(ctx)

// Cancel all goroutines
cancel()
```

## 📊 Performance Comparison

Creating 1 million concurrent tasks:

| Language/Model | Memory | Time |
|----------------|--------|------|
| Java Threads | ~1GB | Slow |
| Python Threads | Limited by GIL | Slow |
| Goroutines | ~2GB | Fast |

## ✅ Summary

- ✅ Goroutines are lightweight (2KB stack)
- ✅ Use `go` keyword to start
- ✅ Always synchronize (WaitGroup, channels)
- ✅ Prevent leaks with proper exit signals
- ✅ Use worker pools for large numbers
- ✅ Handle panics in long-running goroutines

---

**Next**: [Channels](./channel.md)
