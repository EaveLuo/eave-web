---
sidebar_label: Channel
sidebar_position: 15
date: 2026-02-27T00:39:30.000Z
tags:
  - Go
  - Backend
description: >-
  Channel - Communicating by Sharing Memory Channel is the communication pipe
  between Goroutines
---

# Channel - Communicating by Sharing Memory

Channel is the communication pipe between Goroutines. Go's philosophy is: "Don't communicate by sharing memory; share memory by communicating."

## Package Creating Channels

```go
// Unbuffered Channel
ch := make(chan int)

// Buffered Channel
ch2 := make(chan int, 10)

// Read-only Channel
var ro <-chan int = ch

// Write-only Channel
var wo chan<- int = ch
```

## ArrowsClockwise Basic Operations

### 1. Send

```go
ch <- 42  // Send value
```

### 2. Receive

```go
value := <-ch  // Receive value
```

### 3. Close

```go
close(ch)  // Close Channel
```

## Target Unbuffered Channel

```go
ch := make(chan int)

go func() {
    ch <- 42  // Blocks until someone receives
}()

value := <-ch  // Receive, sender unblocks
fmt.Println(value)  // 42
```

**Characteristics:** Send and receive must be ready simultaneously (synchronous)

## ArtistPalette Buffered Channel

```go
ch := make(chan int, 3)

ch <- 1  // Non-blocking
ch <- 2  // Non-blocking
ch <- 3  // Non-blocking
// ch <- 4  // Blocks, buffer full

fmt.Println(<-ch)  // 1
fmt.Println(<-ch)  // 2
```

**Characteristics:** Non-blocking until buffer is full

## TwistedRightwardsArrows Iterating Over Channels

```go
ch := make(chan int, 3)
ch <- 1
ch <- 2
ch <- 3
close(ch)

// Range iteration (ends when Channel is closed)
for value := range ch {
    fmt.Println(value)
}
```

## PerformingArts Select Multiplexing

```go
ch1 := make(chan int)
ch2 := make(chan int)

select {
case v1 := <-ch1:
    fmt.Println("Received from ch1:", v1)
case v2 := <-ch2:
    fmt.Println("Received from ch2:", v2)
case ch1 <- 42:
    fmt.Println("Sent to ch1")
default:
    fmt.Println("None ready")
}
```

## Target Practical Patterns

### 1. Signal Notification

```go
done := make(chan struct{})

go func() {
    // Work
    fmt.Println("Work done")
    done <- struct{}{}  // Send completion signal
}()

<-done  // Wait for completion
```

### 2. Timeout Control

```go
ch := make(chan int)
timeout := time.After(time.Second)

select {
case result := <-ch:
    fmt.Println("Result:", result)
case <-timeout:
    fmt.Println("Timeout!")
}
```

### 3. Cancellation

```go
ctx, cancel := context.WithCancel(context.Background())

go func() {
    select {
    case <-ctx.Done():
        fmt.Println("Cancelled")
        return
    default:
        // Work
    }
}()

// Cancel
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

// Pipeline
ch := gen(1, 2, 3)
ch = square(ch)

for result := range ch {
    fmt.Println(result)  // 1, 4, 9
}
```

## Bug Common Mistakes

### 1. Sending to Closed Channel

```go
ch := make(chan int)
close(ch)

// CrossMark panic
ch <- 42
```

### 2. Double Close

```go
ch := make(chan int)
close(ch)

// CrossMark panic
close(ch)
```

### 3. Goroutine Leak

```go
// CrossMark Leak
ch := make(chan int)
go func() {
    ch <- 42  // Blocks, no one receives
}()

// WhiteCheckMark Correct
ch := make(chan int, 1)
go func() {
    ch <- 42  // Non-blocking
}()
```

## LightBulb Best Practices

### 1. Sender Closes Channel

```go
// WhiteCheckMark Sender closes
func producer(ch chan<- int) {
    ch <- 1
    ch <- 2
    close(ch)  // Sender closes
}

// CrossMark Receiver closes
func consumer(ch <-chan int) {
    // close(ch)  // Error!
}
```

### 2. Use Context for Control

```go
func worker(ctx context.Context, ch <-chan int) {
    for {
        select {
        case <-ctx.Done():
            return  // Graceful exit
        case n := <-ch:
            fmt.Println(n)
        }
    }
}
```

### 3. Buffer Size Selection

```go
// No buffer needed
ch := make(chan int)

// Small buffer needed (performance improvement)
ch := make(chan int, 10)

// Avoid large buffers (may hide problems)
ch := make(chan int, 1000)  // CrossMark
```

## WhiteCheckMark Summary

- WhiteCheckMark Channel is the communication pipe between Goroutines
- WhiteCheckMark Unbuffered = synchronous, Buffered = asynchronous
- WhiteCheckMark Sender is responsible for closing Channel
- WhiteCheckMark Select enables multiplexing
- WhiteCheckMark Use context for cancellation control
- WhiteCheckMark Avoid sending to closed Channel

---

**Next Chapter**: [Select](./select.md)

You will learn:
- Select statement details
- Timeout handling
- Non-blocking operations
- Practical tips
