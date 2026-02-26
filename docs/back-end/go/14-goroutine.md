---
sidebar_label: 14. Goroutine
sidebar_position: 14
---

# Goroutine - 并发编程的利器

Goroutine 是 Go 的杀手锏。它让并发编程变得像写顺序代码一样简单。

## 🚀 什么是 Goroutine？

Goroutine 是 Go 的**轻量级线程**：

```go
func sayHello() {
    fmt.Println("Hello!")
}

// 启动 Goroutine
go sayHello()

// 主程序继续执行，不等待
fmt.Println("继续执行...")
```

## 🎯 创建 Goroutine

### 1. 函数

```go
func worker(id int) {
    fmt.Printf("Worker %d 开始工作\n", id)
}

go worker(1)
go worker(2)
go worker(3)
```

### 2. 匿名函数

```go
go func() {
    fmt.Println("匿名函数执行")
}()

// 带参数
go func(name string) {
    fmt.Println("你好，", name)
}("张三")
```

### 3. 方法

```go
type Server struct{}

func (s *Server) HandleRequest() {
    // 处理请求
}

server := &Server{}
go server.HandleRequest()
```

## ⏱️ Goroutine 生命周期

```go
go func() {
    // 1. 执行代码
    fmt.Println("开始")
    
    // 2. 可能阻塞
    time.Sleep(time.Second)
    
    // 3. 执行完毕，退出
    fmt.Println("结束")
}()

// 主程序需要等待，否则 Goroutine 可能没执行完就退出
time.Sleep(2 * time.Second)
```

## 🔀 WaitGroup 等待多个 Goroutine

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)  // 计数 +1
    
    go func(id int) {
        defer wg.Done()  // 计数 -1
        fmt.Printf("Worker %d 完成\n", id)
    }(i)
}

wg.Wait()  // 等待所有完成
fmt.Println("所有 Worker 完成")
```

## 🎨 并发模式

### 1. Fan-Out（分发）

```go
// 多个 Worker 处理任务
func worker(id int, jobs <-chan int) {
    for job := range jobs {
        fmt.Printf("Worker %d 处理任务 %d\n", id, job)
    }
}

jobs := make(chan int, 100)

// 启动 3 个 Worker
for w := 1; w <= 3; w++ {
    go worker(w, jobs)
}

// 发送任务
for j := 1; j <= 10; j++ {
    jobs <- j
}
close(jobs)
```

### 2. Fan-In（汇聚）

```go
func merge(cs ...<-chan int) <-chan int {
    out := make(chan int)
    
    var wg sync.WaitGroup
    
    // 从每个 channel 读取
    for _, c := range cs {
        wg.Add(1)
        go func(ch <-chan int) {
            defer wg.Done()
            for n := range ch {
                out <- n
            }
        }(c)
    }
    
    // 所有输入关闭后关闭输出
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}
```

### 3. Worker Pool

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        results <- job * 2  // 处理
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    
    // 启动 5 个 Worker
    for w := 1; w <= 5; w++ {
        go worker(w, jobs, results)
    }
    
    // 发送任务
    for j := 1; j <= 10; j++ {
        jobs <- j
    }
    close(jobs)
    
    // 收集结果
    for r := 1; r <= 10; r++ {
        fmt.Println(<-results)
    }
}
```

## 🐛 常见问题

### 1. 变量捕获

```go
// ❌ 错误
for i := 0; i < 3; i++ {
    go func() {
        fmt.Println(i)  // 可能输出 3,3,3
    }()
}

// ✅ 正确
for i := 0; i < 3; i++ {
    i := i  // 创建新变量
    go func() {
        fmt.Println(i)  // 输出 0,1,2
    }()
}

// 或作为参数
for i := 0; i < 3; i++ {
    go func(i int) {
        fmt.Println(i)
    }(i)
}
```

### 2. Goroutine 泄漏

```go
// ❌ 泄漏：channel 永不关闭
func leak() <-chan int {
    out := make(chan int)
    go func() {
        for i := 0; ; i++ {
            out <- i
        }
    }()
    return out
}

// ✅ 正确
func noLeak() <-chan int {
    out := make(chan int)
    go func() {
        for i := 0; i < 100; i++ {
            out <- i
        }
        close(out)  // 关闭 channel
    }()
    return out
}
```

### 3. 竞态条件

```go
var count int

// ❌ 不安全
for i := 0; i < 1000; i++ {
    go func() {
        count++  // 多个 Goroutine 同时修改
    }()
}

// ✅ 使用原子操作
var count2 int32
for i := 0; i < 1000; i++ {
    go func() {
        atomic.AddInt32(&count2, 1)
    }()
}

// 或使用互斥锁
var (
    mu    sync.Mutex
    count3 int
)
for i := 0; i < 1000; i++ {
    go func() {
        mu.Lock()
        count3++
        mu.Unlock()
    }()
}
```

## 💡 最佳实践

### 1. 限制 Goroutine 数量

```go
// 使用信号量限制并发数
sem := make(chan struct{}, 10)

for i := 0; i < 100; i++ {
    sem <- struct{}{}  // 获取信号量
    
    go func() {
        defer func() { <-sem }()  // 释放信号量
        // 执行任务
    }()
}
```

### 2. 优雅关闭

```go
type Worker struct {
    quit chan struct{}
}

func (w *Worker) Start() {
    go func() {
        for {
            select {
            case <-w.quit:
                return  // 优雅退出
            default:
                // 工作
            }
        }
    }()
}

func (w *Worker) Stop() {
    close(w.quit)
}
```

### 3. 错误传播

```go
type Result struct {
    value int
    err   error
}

func worker(id int, results chan<- Result) {
    // 工作
    results <- Result{value: id, err: nil}
}

results := make(chan Result, 10)
for i := 0; i < 10; i++ {
    go worker(i, results)
}

// 收集结果和错误
for i := 0; i < 10; i++ {
    r := <-results
    if r.err != nil {
        log.Printf("Worker 错误：%v", r.err)
    }
}
```

## ✅ 知识点总结

- ✅ `go` 关键字启动 Goroutine
- ✅ Goroutine 轻量级，可创建成千上万个
- ✅ WaitGroup 等待多个 Goroutine
- ✅ 注意变量捕获问题
- ✅ 避免 Goroutine 泄漏
- ✅ 使用 channel 或 mutex 避免竞态

---

**下一章**：[Channel](./15-channel.md)

你将学习：
- Channel 是什么
- 无缓冲和有缓冲 Channel
- Channel 操作
- 实战模式
