---
sidebar_label: Build RPC Framework
sidebar_position: 24
---

# Building an RPC Framework from Scratch

Learn distributed systems by building your own RPC framework.

## 🎯 What is RPC?

Remote Procedure Call allows calling functions on remote servers as if they were local.

```go
// Client calls this:
result, err := client.Call("Add", 1, 2)

// Server executes this:
func Add(a, b int) int { return a + b }
```

## 📦 Core Components

### 1. Protocol Design

```go
type Request struct {
    ServiceMethod string
    Seq           uint64
    Args          interface{}
}

type Response struct {
    Seq    uint64
    Error  string
    Reply  interface{}
}
```

### 2. Transport Layer

```go
// TCP transport
func (s *Server) Serve(lis net.Listener) {
    for {
        conn, _ := lis.Accept()
        go s.ServeConn(conn)
    }
}
```

### 3. Serialization

Use `encoding/gob` or `encoding/json`:

```go
// Encode request
enc := gob.NewEncoder(conn)
enc.Encode(request)

// Decode response
dec := gob.NewDecoder(conn)
dec.Decode(&response)
```

## 💡 Key Features to Implement

1. **Service Registration** - Map method names to functions
2. **Connection Pool** - Reuse connections
3. **Timeout Handling** - Context support
4. **Load Balancing** - Multiple servers
5. **Circuit Breaker** - Fail fast on errors

## 🚀 Example Usage

```go
// Server
server := rpc.NewServer()
server.Register(&Calculator{})
lis, _ := net.Listen("tcp", ":9999")
server.Serve(lis)

// Client
client, _ := rpc.Dial("tcp", "localhost:9999")
var result int
client.Call("Calculator.Add", Args{1, 2}, &result)
```

---

**Next**: [Deployment and Operations](./部署与运维.md)
