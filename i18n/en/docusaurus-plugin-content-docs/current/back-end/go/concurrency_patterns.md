---
sidebar_label: Concurrency Patterns
sidebar_position: 18
---

# Concurrency Patterns - Best Practices in Practice

Concurrency patterns are standard solutions to common concurrency problems. Master these patterns to make your concurrent code more reliable.

## Target Basic Patterns

### 1. Generator Pattern

```go
// Generate number sequence
func generate(n int) <-chan int {
    ch := make(chan int)
    
    go func() {
        for i := 0; i < n; i++ {
            ch <- i
        }
        close(ch)
    }()
    
    return ch
}

// Usage
for num := range generate(10) {
    fmt.Println(num)
}
```

### 2. Pipeline Pattern

```go
// Stage 1: Generate
func generate(nums []int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

// Stage 2: Process
func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

// Stage 3: Collect
func collect(in <-chan int) []int {
    var result []int
    for n := range in {
        result = append(result, n)
    }
    return result
}

// Compose
nums := []int{1, 2, 3, 4, 5}
ch := generate(nums)
ch = square(ch)
result := collect(ch)
```

### 3. Fan-out Fan-in Pattern

```go
// Fan-out: Distribute tasks
func fanOut(in <-chan int, n int) []<-chan int {
    outs := make([]<-chan int, n)
    for i := 0; i < n; i++ {
        out := make(chan int)
        outs[i] = out
        
        go func(o chan<- int) {
            for v := range in {
                o <- v
            }
            close(o)
        }(out)
    }
    return outs
}

// Fan-in: Aggregate results
func fanIn(overs ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    
    for _, ch := range overs {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(ch)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}
```

## Rocket Advanced Patterns

### Worker Pool Pattern

```go
type Job struct {
    ID   int
    Data string
}

type Result struct {
    JobID int
    Value string
}

func worker(id int, jobs <-chan Job, results chan<- Result) {
    for job := range jobs {
        // Process job
        result := Result{
            JobID: job.ID,
            Value: process(job.Data),
        }
        results <- result
    }
}

func main() {
    jobs := make(chan Job, 100)
    results := make(chan Result, 100)
    
    // Start workers
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }
    
    // Send jobs
    for j := 1; j <= 9; j++ {
        jobs <- Job{ID: j, Data: fmt.Sprintf("job-%d", j)}
    }
    close(jobs)
    
    // Collect results
    for a := 1; a <= 9; a++ {
        result := <-results
        fmt.Printf("Job %d completed\n", result.JobID)
    }
}
```

### Rate Limiting Pattern

```go
func rateLimiter(rps int) chan struct{} {
    limiter := make(chan struct{}, rps)
    
    go func() {
        ticker := time.NewTicker(time.Second / time.Duration(rps))
        defer ticker.Stop()
        
        for range ticker.C {
            select {
            case limiter <- struct{}{}:
            default:
            }
        }
    }()
    
    return limiter
}

// Usage
limiter := rateLimiter(10)  // 10 requests per second

for req := range requests {
    <-limiter  // Wait for token
    process(req)
}
```

### Circuit Breaker Pattern

```go
type CircuitBreaker struct {
    failures    int
    threshold   int
    lastFailure time.Time
    timeout     time.Duration
    mu          sync.Mutex
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    cb.mu.Lock()
    
    if cb.failures >= cb.threshold {
        if time.Since(cb.lastFailure) < cb.timeout {
            cb.mu.Unlock()
            return errors.New("circuit breaker open")
        }
        // Reset after timeout
        cb.failures = 0
    }
    
    cb.mu.Unlock()
    
    err := fn()
    
    cb.mu.Lock()
    defer cb.mu.Unlock()
    
    if err != nil {
        cb.failures++
        cb.lastFailure = time.Now()
    } else {
        cb.failures = 0
    }
    
    return err
}
```

### Timeout Pattern

```go
func withTimeout(fn func() error, timeout time.Duration) error {
    done := make(chan error, 1)
    
    go func() {
        done <- fn()
    }()
    
    select {
    case err := <-done:
        return err
    case <-time.After(timeout):
        return errors.New("timeout")
    }
}

// Usage
err := withTimeout(func() error {
    return longRunningOperation()
}, 5*time.Second)
```

### Retry Pattern

```go
func retry(attempts int, delay time.Duration, fn func() error) error {
    var err error
    
    for i := 0; i < attempts; i++ {
        err = fn()
        if err == nil {
            return nil
        }
        
        if i < attempts-1 {
            time.Sleep(delay)
            delay *= 2  // Exponential backoff
        }
    }
    
    return fmt.Errorf("failed after %d attempts: %w", attempts, err)
}

// Usage
err := retry(3, time.Second, func() error {
    return callAPI()
})
```

## Warning Common Pitfalls

### 1. Goroutine Leaks

```go
// CrossMark Leak
func process(items []int) {
    ch := make(chan int)
    go func() {
        for _, item := range items {
            ch <- item
        }
    }()
    
    for v := range ch {  // Never ends!
        fmt.Println(v)
    }
}

// WhiteCheckMark Correct
func process(items []int) {
    ch := make(chan int)
    go func() {
        defer close(ch)  // Close when done
        for _, item := range items {
            ch <- item
        }
    }()
    
    for v := range ch {
        fmt.Println(v)
    }
}
```

### 2. Race Conditions

```go
// CrossMark Race condition
var counter int
for i := 0; i < 1000; i++ {
    go func() {
        counter++
    }()
}

// WhiteCheckMark Use atomic or mutex
var counter int64
for i := 0; i < 1000; i++ {
    go func() {
        atomic.AddInt64(&counter, 1)
    }()
}
```

### 3. Deadlocks

```go
// CrossMark Deadlock
ch1 := make(chan int)
ch2 := make(chan int)

go func() {
    ch1 <- 1
    <-ch2
}()

go func() {
    ch2 <- 2
    <-ch1
}()

// WhiteCheckMark Use select with timeout
select {
case ch1 <- 1:
    <-ch2
case <-time.After(time.Second):
    log.Println("timeout")
}
```

## LightBulb Best Practices

### 1. Always Close Channels

```go
// Sender closes
func producer() <-chan int {
    ch := make(chan int)
    go func() {
        defer close(ch)
        for i := 0; i < 10; i++ {
            ch <- i
        }
    }()
    return ch
}
```

### 2. Use Context for Cancellation

```go
func worker(ctx context.Context, jobs <-chan int) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        case job, ok := <-jobs:
            if !ok {
                return nil
            }
            process(job)
        }
    }
}
```

### 3. Limit Concurrent Goroutines

```go
sem := make(chan struct{}, 10)  // Max 10 concurrent

for _, task := range tasks {
    sem <- struct{}{}  // Acquire
    go func(t Task) {
        defer func() { <-sem }()  // Release
        process(t)
    }(task)
}

// Wait for all
for i := 0; i < cap(sem); i++ {
    sem <- struct{}{}
}
```

## WhiteCheckMark Key Points Summary

- WhiteCheckMark Use generator pattern for lazy evaluation
- WhiteCheckMark Pipeline pattern for staged processing
- WhiteCheckMark Fan-out/fan-in for parallel processing
- WhiteCheckMark Worker pool for controlled concurrency
- WhiteCheckMark Always handle timeouts and cancellation
- WhiteCheckMark Protect shared state properly

---

**Next Chapter**: [Performance Optimization](./性能优化.md)

You will learn:
- Profiling techniques
- Memory optimization
- CPU optimization
- Benchmarking best practices
