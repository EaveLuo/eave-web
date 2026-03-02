---
sidebar_label: Performance Optimization
sidebar_position: 19
---

# Performance Optimization - Writing Efficient Go Code

Performance optimization needs data support. Learn to use tools, find bottlenecks, and optimize effectively.

## MagnifyingGlassTiltedLeft Profiling Tools

### 1. Benchmark Testing

```go
// benchmark_test.go
func BenchmarkStringConcat(b *testing.B) {
    for i := 0; i < b.N; i++ {
        s := ""
        for j := 0; j < 100; j++ {
            s += "hello"
        }
    }
}

func BenchmarkStringBuilder(b *testing.B) {
    for i := 0; i < b.N; i++ {
        var builder strings.Builder
        for j := 0; j < 100; j++ {
            builder.WriteString("hello")
        }
        _ = builder.String()
    }
}

// Run
// go test -bench=. -benchmem
```

### 2. CPU Profiling

```go
// main.go
import (
    "runtime/pprof"
    "os"
)

func main() {
    f, _ := os.Create("cpu.prof")
    pprof.StartCPUProfile(f)
    defer pprof.StopCPUProfile()
    
    // Program logic
}

// Analyze
// go tool pprof cpu.prof
```

### 3. Memory Profiling

```go
import (
    "runtime"
    "runtime/pprof"
)

func memProfile() {
    runtime.GC()
    f, _ := os.Create("mem.prof")
    pprof.WriteHeapProfile(f)
    f.Close()
}
```

## HighVoltage Optimization Techniques

### 1. String Concatenation

```go
// CrossMark Inefficient
s := ""
for i := 0; i < 1000; i++ {
    s += strconv.Itoa(i)
}

// WhiteCheckMark Efficient
var builder strings.Builder
for i := 0; i < 1000; i++ {
    builder.WriteString(strconv.Itoa(i))
}
s := builder.String()

// Or
parts := make([]string, 1000)
for i := 0; i < 1000; i++ {
    parts[i] = strconv.Itoa(i)
}
s := strings.Join(parts, "")
```

### 2. Slice Pre-allocation

```go
// CrossMark Multiple allocations
var result []int
for i := 0; i < 1000; i++ {
    result = append(result, i)
}

// WhiteCheckMark Single allocation
result := make([]int, 0, 1000)
for i := 0; i < 1000; i++ {
    result = append(result, i)
}
```

### 3. Map Pre-allocation

```go
// CrossMark Multiple expansions
m := make(map[string]int)
for i := 0; i < 10000; i++ {
    m[strconv.Itoa(i)] = i
}

// WhiteCheckMark Pre-allocate
m := make(map[string]int, 10000)
for i := 0; i < 10000; i++ {
    m[strconv.Itoa(i)] = i
}
```

### 4. Avoid Unnecessary Conversions

```go
// CrossMark Unnecessary conversion
b := []byte("constant string")

// WhiteCheckMark Use string directly
s := "constant string"
```

### 5. Reuse Objects with sync.Pool

```go
var bufferPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func process() {
    buf := bufferPool.Get().(*bytes.Buffer)
    defer bufferPool.Put(buf)
    
    buf.Reset()
    // Use buffer...
}
```

## BarChart Benchmarking Best Practices

### Write Good Benchmarks

```go
func BenchmarkFoo(b *testing.B) {
    // Setup (not measured)
    data := generateData()
    
    b.ResetTimer()  // Reset timer
    for i := 0; i < b.N; i++ {
        Foo(data)
    }
    
    b.StopTimer()  // Stop timer
    // Cleanup
}
```

### Compare Implementations

```go
func BenchmarkA(b *testing.B) {
    for i := 0; i < b.N; i++ {
        implementationA()
    }
}

func BenchmarkB(b *testing.B) {
    for i := 0; i < b.N; i++ {
        implementationB()
    }
}

// Run: go test -bench=. -benchmem
```

### Sub-benchmarks

```go
func BenchmarkProcess(b *testing.B) {
    sizes := []int{10, 100, 1000}
    
    for _, size := range sizes {
        b.Run(fmt.Sprintf("size-%d", size), func(b *testing.B) {
            data := make([]int, size)
            
            b.ResetTimer()
            for i := 0; i < b.N; i++ {
                Process(data)
            }
        })
    }
}
```

## Warning Common Mistakes

### 1. Premature Optimization

```go
// CrossMark Don't optimize without profiling first
// Write clear code first, optimize when needed
```

### 2. Ignoring Memory Allocations

```go
// CrossMark Hidden allocations
func process(items []Item) []Result {
    var results []Result
    for _, item := range items {
        results = append(results, heavyOperation(item))  // Allocates
    }
    return results
}

// WhiteCheckMark Pre-allocate
func process(items []Item) []Result {
    results := make([]Result, 0, len(items))
    for _, item := range items {
        results = append(results, heavyOperation(item))
    }
    return results
}
```

### 3. Not Using Profiling

Always profile before optimizing:
```bash
# CPU profiling
go test -bench=. -cpuprofile=cpu.prof
go tool pprof cpu.prof

# Memory profiling
go test -bench=. -memprofile=mem.prof
go tool pprof mem.prof
```

## LightBulb Best Practices

### 1. Measure Before Optimizing

```bash
# Get baseline
go test -bench=. -count=5 > old.txt

# Make changes

# Compare
go test -bench=. -count=5 > new.txt
benchstat old.txt new.txt
```

### 2. Focus on Hot Paths

```go
// Optimize the code that runs most frequently
// Don't micro-optimize initialization code
```

### 3. Use Appropriate Data Structures

```go
// Use map for O(1) lookups
lookup := make(map[string]bool)

// Use slice for ordered data
ordered := make([]string, 0, n)

// Use heap for priority queue
h := &IntHeap{}
heap.Init(h)
```

### 4. Consider Concurrency Carefully

```go
// Not always faster due to overhead
// Profile to verify benefits
```

## WhiteCheckMark Key Points Summary

- WhiteCheckMark Always profile before optimizing
- WhiteCheckMark Use benchmarks to measure improvements
- WhiteCheckMark Pre-allocate slices and maps
- WhiteCheckMark Use strings.Builder for concatenation
- WhiteCheckMark Reuse objects with sync.Pool
- WhiteCheckMark Focus on hot paths

---

**Next Chapter**: [Testing](./测试.md)

You will learn:
- Unit testing techniques
- Table-driven tests
- Mocking and stubs
- Test coverage
