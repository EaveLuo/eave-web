---
sidebar_label: Channel
sidebar_position: 15
date: "2026-02-27T08:39:30+08:00"
tags: [Go, 后端]
---
# Channel - 通信共享内存

Channel 是 Goroutine 之间的通信管道。Go 的哲学是："不要通过共享内存来通信，而要通过通信来共享内存"。

## 📦 创建 Channel

```go
// 无缓冲 Channel
ch := make(chan int)

// 有缓冲 Channel
ch2 := make(chan int, 10)

// 只读 Channel
var ro <-chan int = ch

// 只写 Channel
var wo chan<- int = ch
```

## 🔄 基本操作

### 1. 发送

```go
ch <- 42  // 发送值
```

### 2. 接收

```go
value := <-ch  // 接收值
```

### 3. 关闭

```go
close(ch)  // 关闭 Channel
```

## 🎯 无缓冲 Channel

```go
ch := make(chan int)

go func() {
    ch <- 42  // 阻塞，直到有人接收
}()

value := <-ch  // 接收，发送方解除阻塞
fmt.Println(value)  // 42
```

**特点：** 发送和接收必须同时准备好（同步）

## 🎨 有缓冲 Channel

```go
ch := make(chan int, 3)

ch <- 1  // 不阻塞
ch <- 2  // 不阻塞
ch <- 3  // 不阻塞
// ch <- 4  // 阻塞，缓冲区满

fmt.Println(<-ch)  // 1
fmt.Println(<-ch)  // 2
```

**特点：** 缓冲区满前不阻塞

## 🔀 遍历 Channel

```go
ch := make(chan int, 3)
ch <- 1
ch <- 2
ch <- 3
close(ch)

// range 遍历（Channel 关闭后结束）
for value := range ch {
    fmt.Println(value)
}
```

## 🎭 Select 多路复用

```go
ch1 := make(chan int)
ch2 := make(chan int)

select {
case v1 := <-ch1:
    fmt.Println("从 ch1 接收:", v1)
case v2 := <-ch2:
    fmt.Println("从 ch2 接收:", v2)
case ch1 <- 42:
    fmt.Println("发送到 ch1")
default:
    fmt.Println("都没有准备好")
}
```

## 🎯 实战模式

### 1. 信号通知

```go
done := make(chan struct{})

go func() {
    // 工作
    fmt.Println("工作完成")
    done <- struct{}{}  // 发送完成信号
}()

<-done  // 等待完成
```

### 2. 超时控制

```go
ch := make(chan int)
timeout := time.After(time.Second)

select {
case result := <-ch:
    fmt.Println("结果:", result)
case <-timeout:
    fmt.Println("超时！")
}
```

### 3. 取消操作

```go
ctx, cancel := context.WithCancel(context.Background())

go func() {
    select {
    case <-ctx.Done():
        fmt.Println("被取消")
        return
    default:
        // 工作
    }
}()

// 取消
cancel()
```

### 4. 管道模式

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

## 🐛 常见错误

### 1. 向已关闭的 Channel 发送

```go
ch := make(chan int)
close(ch)

// ❌ panic
ch <- 42
```

### 2. 重复关闭

```go
ch := make(chan int)
close(ch)

// ❌ panic
close(ch)
```

### 3. Goroutine 泄漏

```go
// ❌ 泄漏
ch := make(chan int)
go func() {
    ch <- 42  // 阻塞，没人接收
}()

// ✅ 正确
ch := make(chan int, 1)
go func() {
    ch <- 42  // 不阻塞
}()
```

## 💡 最佳实践

### 1. 发送方关闭 Channel

```go
// ✅ 发送方关闭
func producer(ch chan<- int) {
    ch <- 1
    ch <- 2
    close(ch)  // 发送方关闭
}

// ❌ 接收方关闭
func consumer(ch <-chan int) {
    // close(ch)  // 错误！
}
```

### 2. 使用 context 控制

```go
func worker(ctx context.Context, ch <-chan int) {
    for {
        select {
        case <-ctx.Done():
            return  // 优雅退出
        case n := <-ch:
            fmt.Println(n)
        }
    }
}
```

### 3. 缓冲大小选择

```go
// 不需要缓冲
ch := make(chan int)

// 需要小缓冲（提高性能）
ch := make(chan int, 10)

// 避免大缓冲（可能掩盖问题）
ch := make(chan int, 1000)  // ❌
```

## ✅ 知识点总结

- ✅ Channel 是 Goroutine 间的通信管道
- ✅ 无缓冲=同步，有缓冲=异步
- ✅ 发送方负责关闭 Channel
- ✅ select 实现多路复用
- ✅ 用 context 控制取消
- ✅ 避免向已关闭的 Channel 发送

---

**下一章**：[Select](./select.md)

你将学习：
- select 语句详解
- 超时处理
- 非阻塞操作
- 实战技巧
