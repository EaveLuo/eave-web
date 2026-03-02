---
sidebar_label: Channel
sidebar_position: 15
---

# Channel - Communicating by Sharing Memory

Channel is the communication pipe between Goroutines。Go 的哲学是："Don't communicate by sharing memory; share memory by communicating"。

## 📦 Creating Channel

```go
// Unbuffered Channel
ch := make(chan int)

// Buffered Channel
ch2 := make(chan int, 10)

// 只读 Channel
var ro <-chan int = ch

// 只写 Channel
var wo chan<- int = ch
```

## 🔄 Basic Operations

### 1. Send

```go
ch <- 42  // Send值
```

### 2. Receive

```go
value := <-ch  // Receive值
```

### 3. Close

```go
close(ch)  // Close Channel
```

## 🎯 Unbuffered Channel

```go
ch := make(chan int)

go func() {
    ch <- 42  // 阻塞，直到有人Receive
}()

value := <-ch  // Receive，Send方解除阻塞
fmt.Println(value)  // 42
```

**特点：** Send和Receive必须同时准备好（同步）

## 🎨 Buffered Channel

```go
ch := make(chan int, 3)

ch <- 1  // non-blocking
ch <- 2  // non-blocking
ch <- 3  // non-blocking
// ch <- 4  // 阻塞，缓冲区满

fmt.Println(<-ch)  // 1
fmt.Println(<-ch)  // 2
```

**特点：** Non-blocking until buffer is full

## 🔀 Iterating Over Channel

```go
ch := make(chan int, 3)
ch <- 1
ch <- 2
ch <- 3
close(ch)

// range Iterating Over（Channel Close后结束）
for value := range ch {
    fmt.Println(value)
}
```

## 🎭 Select Multiplexing

```go
ch1 := make(chan int)
ch2 := make(chan int)

select {
case v1 := <-ch1:
    fmt.Println("从 ch1 Receive:", v1)
case v2 := <-ch2:
    fmt.Println("从 ch2 Receive:", v2)
case ch1 <- 42:
    fmt.Println("Send到 ch1")
default:
    fmt.Println("none ready")
}
```

## 🎯 Practical Patterns

### 1. Signal Notification

```go
done := make(chan struct{})

go func() {
    // 工作
    fmt.Println("work done")
    done <- struct{}{}  // Send完成信号
}()

<-done  // wait for completion
```

### 2. Timeout Control

```go
ch := make(chan int)
timeout := time.After(time.Second)

select {
case result := <-ch:
    fmt.Println("result:", result)
case <-timeout:
    fmt.Println("timeout！")
}
```

### 3. Cancellation

```go
ctx, cancel := context.WithCancel(context.Background())

go func() {
    select {
    case <-ctx.Done():
        fmt.Println("cancelled")
        return
    default:
        // 工作
    }
}()

// 取消
cancel()
```

### 4. Pipeline Pattern

```go
func gen(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

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

// 管道
ch := gen(1, 2, 3)
ch = square(ch)

for result := range ch {
    fmt.Println(result)  // 1, 4, 9
}
```

## 🐛 Common Mistakes

### 1. 向已Close的 Channel Send

```go
ch := make(chan int)
close(ch)

// ❌ panic
ch <- 42
```

### 2. 重复Close

```go
ch := make(chan int)
close(ch)

// ❌ panic
close(ch)
```

### 3. Goroutine leak

```go
// ❌ leak
ch := make(chan int)
go func() {
    ch <- 42  // 阻塞，没人Receive
}()

// ✅ correct
ch := make(chan int, 1)
go func() {
    ch <- 42  // non-blocking
}()
```

## 💡 Best Practices

### 1. Send方Close Channel

```go
// ✅ Send方Close
func producer(ch chan<- int) {
    ch <- 1
    ch <- 2
    close(ch)  // Send方Close
}

// ❌ Receive方Close
func consumer(ch <-chan int) {
    // close(ch)  // Error！
}
```

### 2. 使用 context 控制

```go
func worker(ctx context.Context, ch <-chan int) {
    for {
        select {
        case <-ctx.Done():
            return  // graceful exit
        case n := <-ch:
            fmt.Println(n)
        }
    }
}
```

### 3. 缓冲大小选择

```go
// No buffer needed
ch := make(chan int)

// Small buffer needed (performance improvement)
ch := make(chan int, 10)

// Avoid large buffers (may hide problems)
ch := make(chan int, 1000)  // ❌
```

## ✅ Summary

- ✅ Channel is the communication pipe between Goroutines
- ✅ Unbuffered=同步，Buffered=异步
- ✅ Send方负责Close Channel
- ✅ select 实现Multiplexing
- ✅ Use context for cancellation control
- ✅ 避免向已Close的 Channel Send

---

**Next Chapter**：[Select](./select.md)

You will learn：
- select 语句详解
- timeout处理
- Non-blocking Operations
- 实战技巧
