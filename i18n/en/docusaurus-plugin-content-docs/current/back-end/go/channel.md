---
sidebar_label: Channels
sidebar_position: 15
---

# Channels - Communication Between Goroutines

Channels are typed conduits for communication and synchronization between goroutines.

## 📦 Creating Channels

```go
// Unbuffered channel
ch := make(chan int)

// Buffered channel (capacity 5)
ch := make(chan int, 5)
```

## 🔄 Send and Receive

```go
ch := make(chan string)

// Send
go func() {
    ch <- "Hello"
}()

// Receive
msg := <-ch
fmt.Println(msg)  // Hello
```

## 📊 Buffered vs Unbuffered

### Unbuffered (Synchronous)

```go
ch := make(chan int)

// Blocks until receiver is ready
ch <- 42  // Sender blocks here

// Blocks until sender is ready
value := <-ch  // Receiver blocks here
```

### Buffered (Asynchronous)

```go
ch := make(chan int, 2)

// Doesn't block until buffer full
ch <- 1
ch <- 2
ch <- 3  // Blocks here (buffer full)
```

## 🔒 Channel Operations

### Close Channel

```go
ch := make(chan int)

// Producer
go func() {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)  // Signal no more values
}()

// Consumer
for v := range ch {  // Range over channel
    fmt.Println(v)
}
```

### Check Channel State

```go
v, ok := <-ch
if !ok {
    // Channel closed
}
```

## 💡 Best Practices

1. **Close from sender, not receiver**
2. **Don't close twice** - Causes panic
3. **Use for-range to receive** - Handles closing automatically
4. **Buffered for performance** - When producer/consumer speeds differ

---

**Next**: [Select](./select.md)
