---
sidebar_label: Select
sidebar_position: 16
---

# Select - The Art of Multiplexing

select lets a Goroutine wait on multiple Channel operations，is the core tool for concurrent programming。

## 🎯 Select 基础

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
}
```

**特点：**
- randomly selects an executable case
- blocks when none are executable (unless there's default)

## ⏱️ timeout处理

```go
ch := make(chan int)
timeout := time.After(2 * time.Second)

select {
case result := <-ch:
    fmt.Println("结果:", result)
case <-timeout:
    fmt.Println("超时！")
}
```

## 🚀 Non-blocking Operations

```go
ch := make(chan int, 1)

select {
case ch <- 42:
    fmt.Println("发送成功")
default:
    fmt.Println("Channel 满，无法发送")
}

select {
case v := <-ch:
    fmt.Println("接收:", v)
default:
    fmt.Println("Channel 空，无法接收")
}
```

## 🎨 Practical Patterns

### 1. Heartbeat Detection

```go
func heartbeat(interval time.Duration) <-chan time.Time {
    ticks := make(chan time.Time)
    
    go func() {
        ticker := time.NewTicker(interval)
        defer ticker.Stop()
        
        for t := range ticker.C {
            select {
            case ticks <- t:
            default:
                // 没人接收，跳过
            }
        }
    }()
    
    return ticks
}

// 使用
for tick := range heartbeat(time.Second) {
    fmt.Println("心跳:", tick)
}
```

### 2. 优雅Close

```go
type Server struct {
    quit chan struct{}
    done chan struct{}
}

func (s *Server) Start() {
    go func() {
        for {
            select {
            case <-s.quit:
                fmt.Println("收到退出信号")
                close(s.done)
                return
            default:
                // 工作
                time.Sleep(100 * time.Millisecond)
            }
        }
    }()
}

func (s *Server) Stop() {
    close(s.quit)
    <-s.done  // 等待完全退出
}
```

### 3. Merging Multiple Channels

```go
func merge(ch1, ch2 <-chan int) <-chan int {
    out := make(chan int)
    
    go func() {
        defer close(out)
        
        for {
            select {
            case v, ok := <-ch1:
                if !ok {
                    ch1 = nil  // 关闭后不再监听
                } else {
                    out <- v
                }
            case v, ok := <-ch2:
                if !ok {
                    ch2 = nil
                } else {
                    out <- v
                }
            }
            
            // 都关闭了，退出
            if ch1 == nil && ch2 == nil {
                return
            }
        }
    }()
    
    return out
}
```

### 4. Fan-out Fan-in

```go
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

## 🐛 Common Mistakes

### 1. Forgetting default

```go
ch := make(chan int)

// ❌ 可能永久阻塞
select {
case v := <-ch:
    fmt.Println(v)
}

// ✅ 有 default
select {
case v := <-ch:
    fmt.Println(v)
default:
    fmt.Println("没有数据")
}
```

### 2. 在循环中Error使用

```go
// ❌ 每次循环都创建新的 select
for {
    select {
    case <-ch:
        // ...
    }
}

// ✅ 正确
for {
    select {
    case <-ch:
        // ...
    case <-quit:
        return
    }
}
```

### 3. Race Conditions

```go
// ❌ 不安全
var count int
go func() {
    for {
        count++
    }
}()

// ✅ 使用 channel
countCh := make(chan int)
go func() {
    count := 0
    for {
        count++
        countCh <- count
    }
}()
```

## 💡 Best Practices

### 1. Clear case ordering

```go
select {
case <-quit:        // 优先级最高
    return
case <-timeout:     // 其次
    handleTimeout()
case result := <-ch:  // 正常流程
    handleResult(result)
}
```

### 2. 避免 Goroutine leak

```go
func doWork() error {
    done := make(chan struct{})
    
    go func() {
        // 工作
        close(done)
    }()
    
    select {
    case <-done:
        return nil
    case <-time.After(time.Minute):
        return errors.New("超时")
    }
}
```

### 3. 测试timeout

```go
func TestTimeout(t *testing.T) {
    ch := make(chan int)
    
    go func() {
        time.Sleep(100 * time.Millisecond)
        ch <- 42
    }()
    
    select {
    case v := <-ch:
        t.Logf("结果：%d", v)
    case <-time.After(50 * time.Millisecond):
        t.Error("超时")
    }
}
```

## ✅ Summary

- ✅ select waits on multiple Channel operations
- ✅ randomly selects executable case
- ✅ default implements non-blocking
- ✅ time.After 实现timeout
- ✅ 用 quit channel 实现优雅Close
- ✅ 注意 Goroutine leak

---

**进阶篇完成！** 🎉

**高级篇预告：**
- 反射 - Runtime Type Introspection
- 并发模式 - Best Practices in Practice
- 性能优化 - 写出高效的 Go 代码
- 项目实战 - Building Complete Applications from Scratch

继续编写高级篇！🚀
