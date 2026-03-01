---
sidebar_label: Select
sidebar_position: 16
---

# Select - Multiplexing Channels

The `select` statement lets a goroutine wait on multiple communication operations.

## 🎯 Basic Select

```go
ch1 := make(chan string)
ch2 := make(chan string)

select {
case msg1 := <-ch1:
    fmt.Println("Received from ch1:", msg1)
case msg2 := <-ch2:
    fmt.Println("Received from ch2:", msg2)
}
```

## 🔀 Key Features

### 1. Non-Blocking with Default

```go
select {
case v := <-ch:
    fmt.Println("Received:", v)
default:
    fmt.Println("No data available")
}
```

### 2. Random Selection

When multiple cases are ready, select picks one randomly:

```go
for i := 0; i < 10; i++ {
    select {
    case ch1 <- i:
        fmt.Println("Sent to ch1")
    case ch2 <- i:
        fmt.Println("Sent to ch2")
    }
}
```

### 3. Timeout Pattern

```go
select {
case result := <-ch:
    fmt.Println("Result:", result)
case <-time.After(5 * time.Second):
    fmt.Println("Timeout!")
}
```

## 💡 Common Patterns

### Graceful Shutdown

```go
for {
    select {
    case job := <-jobs:
        process(job)
    case <-done:
        return  // Exit goroutine
    }
}
```

### Tickers

```go
ticker := time.Tick(1 * time.Second)
for {
    select {
    case <-ticker:
        fmt.Println("Tick")
    }
}
```

---

**Next**: [Concurrency Best Practices](./并发最佳实践.md)
