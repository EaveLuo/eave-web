---
sidebar_label: Building RPC Framework from Scratch
sidebar_position: 21
date: 2026-02-27T00:39:30.000Z
tags:
  - Go
  - Backend
description: >-
  Build a simple RPC framework from scratch to deeply understand RPC principles.
  Covers service registration/discovery, serialization, network transport, load
  balancing and other core components.
---

# Building RPC Framework from Scratch - Implementing RPC Service from Zero

RPC (Remote Procedure Call) is the cornerstone of distributed systems. Let's implement a complete RPC framework from scratch.

## Books What is RPC?

RPC makes remote calls as simple as local function calls:

```go
// Local call
result := add(1, 2)

// RPC call (looks the same!)
result := client.Add(1, 2)
```

## Target Core Components

A complete RPC framework includes:

1. **Service Registration** - Expose callable methods
2. **Client** - Initiate remote calls
3. **Codec** - Serialize requests and responses
4. **Network Transport** - TCP/HTTP data transfer
5. **Service Discovery** - Find available services

## Rocket Step 1: Define Protocol

```go
// rpc/protocol.go
package rpc

import "time"

// Request
type Request struct {
    ServiceMethod string        // "Service.Method"
    Seq           uint64        // Sequence number
    Args          interface{}   // Arguments
}

// Response
type Response struct {
    Seq   uint64        // Sequence number (matches request)
    Error string        // Error message
    Reply interface{}   // Return value
}

// Header
type Header struct {
    MagicNumber uint32        // Magic number for protocol validation
    CodecType   string        // Encoding type (JSON/Gob)
    MessageType byte          // Message type (Request/Response)
    Seq         uint64        // Sequence number
    Timeout     time.Duration // Timeout
}

const (
    MagicNumber = 0x3bef5c
    DefaultTimeout = 10 * time.Second
)
```

## HammerAndWrench Step 2: Implement Codec

```go
// rpc/codec.go
package rpc

import (
    "encoding/gob"
    "encoding/json"
    "io"
)

type CodecType string

const (
    JSONCodec CodecType = "JSON"
    GobCodec  CodecType = "GOB"
)

type Codec interface {
    ReadHeader(*Header) error
    ReadBody(interface{}) error
    Write(*Header, interface{}) error
    Close() error
}

// JSON Codec
type JSONCodec struct {
    conn io.ReadWriteCloser
    enc  *json.Encoder
    dec  *json.Decoder
}

func NewJSONCodec(conn io.ReadWriteCloser) *JSONCodec {
    return &JSONCodec{
        conn: conn,
        enc:  json.NewEncoder(conn),
        dec:  json.NewDecoder(conn),
    }
}

func (c *JSONCodec) ReadHeader(h *Header) error {
    return c.dec.Decode(h)
}

func (c *JSONCodec) ReadBody(body interface{}) error {
    return c.dec.Decode(body)
}

func (c *JSONCodec) Write(h *Header, body interface{}) error {
    if err := c.enc.Encode(h); err != nil {
        return err
    }
    return c.enc.Encode(body)
}

func (c *JSONCodec) Close() error {
    return c.conn.Close()
}

// Gob Codec (Go native, more efficient)
type GobCodec struct {
    conn io.ReadWriteCloser
    enc  *gob.Encoder
    dec  *gob.Decoder
}

func NewGobCodec(conn io.ReadWriteCloser) *GobCodec {
    return &GobCodec{
        conn: conn,
        enc:  gob.NewEncoder(conn),
        dec:  gob.NewDecoder(conn),
    }
}

func (c *GobCodec) ReadHeader(h *Header) error {
    return c.dec.Decode(h)
}

func (c *GobCodec) ReadBody(body interface{}) error {
    return c.dec.Decode(body)
}

func (c *GobCodec) Write(h *Header, body interface{}) error {
    if err := c.enc.Encode(h); err != nil {
        return err
    }
    return c.enc.Encode(body)
}

func (c *GobCodec) Close() error {
    return c.conn.Close()
}
```

## OfficeBuilding Step 3: Implement Server

```go
// rpc/server.go
package rpc

import (
    "fmt"
    "io"
    "log"
    "net"
    "reflect"
    "sync"
)

// Service instance
type Service struct {
    name    string
    rcvr    reflect.Value
    methods map[string]*MethodType
}

// Method type
type MethodType struct {
    method    reflect.Method
    ArgsType  reflect.Type
    ReplyType reflect.Type
}

// RPC Server
type Server struct {
    serviceMap sync.Map  // map[string]*Service
}

// Create server
func NewServer() *Server {
    return &Server{}
}

// Register service
func (s *Server) Register(rcvr interface{}) error {
    serviceName := reflect.TypeOf(rcvr).Elem().Name()
    
    service := &Service{
        name:    serviceName,
        rcvr:    reflect.ValueOf(rcvr),
        methods: make(map[string]*MethodType),
    }
    
    // Iterate through methods
    for m := 0; m < reflect.TypeOf(rcvr).NumMethod(); m++ {
        method := reflect.TypeOf(rcvr).Method(m)
        
        // Check method signature: func (T *T) Method(args *Args, reply *Reply) error
        if method.Type.NumIn() == 3 && method.Type.NumOut() == 1 {
            argsType := method.Type.In(1)
            replyType := method.Type.In(2)
            
            // Args and reply must be pointers
            if argsType.Kind() == reflect.Ptr && replyType.Kind() == reflect.Ptr {
                service.methods[method.Name] = &MethodType{
                    method:    method,
                    ArgsType:  argsType,
                    ReplyType: replyType,
                }
            }
        }
    }
    
    s.serviceMap.Store(serviceName, service)
    return nil
}

// Handle connection
func (s *Server) serveConn(conn io.ReadWriteCloser) {
    codec := NewGobCodec(conn)
    
    var wg sync.WaitGroup
    var seq uint64
    
    for {
        var header Header
        if err := codec.ReadHeader(&header); err != nil {
            if err != io.EOF {
                log.Println("Error reading header:", err)
            }
            break
        }
        
        seq = header.Seq
        
        // Find service
        serviceName, methodName, _ := parseServiceMethod(header.ServiceMethod)
        serviceValue, ok := s.serviceMap.Load(serviceName)
        if !ok {
            s.sendError(codec, header.Seq, fmt.Sprintf("Service not found: %s", serviceName))
            continue
        }
        
        service := serviceValue.(*Service)
        method := service.methods[methodName]
        if method == nil {
            s.sendError(codec, header.Seq, fmt.Sprintf("Method not found: %s", methodName))
            continue
        }
        
        // Create args and reply
        argsValue := reflect.New(method.ArgsType.Elem())
        replyValue := reflect.New(method.ReplyType.Elem())
        
        // Read arguments
        if err := codec.ReadBody(argsValue.Interface()); err != nil {
            s.sendError(codec, header.Seq, err.Error())
            continue
        }
        
        // Call method
        wg.Add(1)
        go func() {
            defer wg.Done()
            
            errValues := method.method.Func.Call([]reflect.Value{
                service.rcvr,
                argsValue,
                replyValue,
            })
            
            // Check error
            var errStr string
            if !errValues[0].IsNil() {
                errStr = errValues[0].Interface().(error).Error()
            }
            
            // Send response
            resp := &Response{
                Seq:   header.Seq,
                Error: errStr,
                Reply: replyValue.Interface(),
            }
            
            if err := codec.Write(&Header{
                Seq: header.Seq,
            }, resp); err != nil {
                log.Println("Error sending response:", err)
            }
        }()
    }
    
    wg.Wait()
    codec.Close()
}

func (s *Server) sendError(codec Codec, seq uint64, errMsg string) {
    resp := &Response{
        Seq:   seq,
        Error: errMsg,
    }
    codec.Write(&Header{Seq: seq}, resp)
}

// Listen for connections
func (s *Server) Listen(network, address string) error {
    listener, err := net.Listen(network, address)
    if err != nil {
        return err
    }
    
    log.Printf("RPC server started on %s://%s\n", network, address)
    
    for {
        conn, err := listener.Accept()
        if err != nil {
            log.Println("Error accepting connection:", err)
            continue
        }
        
        go s.serveConn(conn)
    }
}

func parseServiceMethod(serviceMethod string) (string, string, error) {
    // "Service.Method" -> "Service", "Method"
    // Implementation omitted
    return "", "", nil
}
```

## DesktopComputer Step 4: Implement Client

```go
// rpc/client.go
package rpc

import (
    "errors"
    "fmt"
    "io"
    "log"
    "net"
    "sync"
    "time"
)

// Call record
type Call struct {
    Seq           uint64
    ServiceMethod string
    Args          interface{}
    Reply         interface{}
    Error         error
    Done          chan *Call
}

// RPC Client
type Client struct {
    codec Codec
    seq   uint64
    mutex sync.Mutex
    
    pending map[uint64]*Call
}

// Create client
func Dial(network, address string) (*Client, error) {
    conn, err := net.Dial(network, address)
    if err != nil {
        return nil, err
    }
    
    return NewClient(conn), nil
}

func NewClient(conn io.ReadWriteCloser) *Client {
    client := &Client{
        codec:   NewGobCodec(conn),
        pending: make(map[uint64]*Call),
    }
    
    // Start receive goroutine
    go client.receive()
    
    return client
}

// Remote call
func (c *Client) Call(serviceMethod string, args interface{}, reply interface{}) error {
    call := <-c.goCall(serviceMethod, args, reply, make(chan *Call, 1))
    
    if call.Error != nil {
        return call.Error
    }
    
    return nil
}

// Async call
func (c *Client) goCall(serviceMethod string, args interface{}, reply interface{}, done chan *Call) *Call {
    call := &Call{
        ServiceMethod: serviceMethod,
        Args:          args,
        Reply:         reply,
        Done:          done,
    }
    
    c.mutex.Lock()
    call.Seq = c.seq
    c.seq++
    c.pending[call.Seq] = call
    c.mutex.Unlock()
    
    // Send request
    header := &Header{
        MagicNumber:   MagicNumber,
        CodecType:     string(GobCodec),
        MessageType:   0, // Request
        Seq:           call.Seq,
        Timeout:       DefaultTimeout,
    }
    
    c.mutex.Lock()
    err := c.codec.Write(header, args)
    c.mutex.Unlock()
    
    if err != nil {
        c.mutex.Lock()
        delete(c.pending, call.Seq)
        c.mutex.Unlock()
        
        call.Error = err
        call.Done <- call
    }
    
    return call
}

// Receive response
func (c *Client) receive() {
    var err error
    
    for err == nil {
        header := &Header{}
        
        c.mutex.Lock()
        err = c.codec.ReadHeader(header)
        c.mutex.Unlock()
        
        if err != nil {
            break
        }
        
        c.mutex.Lock()
        call := c.pending[header.Seq]
        delete(c.pending, header.Seq)
        c.mutex.Unlock()
        
        if call == nil {
            log.Println("Received response with unknown sequence:", header.Seq)
            continue
        }
        
        // Read response
        resp := &Response{}
        if err = c.codec.ReadBody(resp); err != nil {
            call.Error = err
        } else if resp.Error != "" {
            call.Error = errors.New(resp.Error)
        } else {
            // Copy reply
            call.Reply = resp.Reply
        }
        
        call.Done <- call
    }
    
    // Connection error, terminate all pending calls
    c.mutex.Lock()
    for _, call := range c.pending {
        call.Error = err
        call.Done <- call
    }
    c.mutex.Unlock()
}

// Close client
func (c *Client) Close() error {
    return c.codec.Close()
}
```

## Memo Step 5: Usage Example

```go
// Define service
type Args struct {
    A, B int
}

type Reply struct {
    C int
}

type MathService struct{}

func (m *MathService) Add(args *Args, reply *Reply) error {
    reply.C = args.A + args.B
    return nil
}

func (m *MathService) Multiply(args *Args, reply *Reply) error {
    reply.C = args.A * args.B
    return nil
}

// Server
func main() {
    server := rpc.NewServer()
    
    // Register service
    mathService := &MathService{}
    server.Register(mathService)
    
    // Start listening
    server.Listen("tcp", ":8080")
}

// Client
func main() {
    // Connect to server
    client, err := rpc.Dial("tcp", "localhost:8080")
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()
    
    // Call Add method
    args := &Args{A: 10, B: 20}
    reply := &Reply{}
    
    err = client.Call("MathService.Add", args, reply)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("10 + 20 = %d\n", reply.C)
    
    // Call Multiply method
    args2 := &Args{A: 5, B: 6}
    reply2 := &Reply{}
    
    err = client.Call("MathService.Multiply", args2, reply2)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("5 * 6 = %d\n", reply2.C)
}
```

## VerticalTrafficLight Step 6: Timeout and Retry

```go
// Enhanced rpc/client.go
func (c *Client) CallWithTimeout(serviceMethod string, args interface{}, reply interface{}, timeout time.Duration) error {
    call := &Call{
        ServiceMethod: serviceMethod,
        Args:          args,
        Reply:         reply,
        Done:          make(chan *Call, 1),
    }
    
    // Send request
    c.goCall(serviceMethod, args, reply, call.Done)
    
    // Wait for response or timeout
    select {
    case call = <-call.Done:
        return call.Error
    case <-time.After(timeout):
        return errors.New("call timeout")
    }
}

// Auto retry
func (c *Client) CallWithRetry(serviceMethod string, args interface{}, reply interface{}, maxRetries int) error {
    var lastErr error
    
    for i := 0; i < maxRetries; i++ {
        if err := c.Call(serviceMethod, args, reply); err == nil {
            return nil
        } else {
            lastErr = err
            time.Sleep(time.Duration(i+1) * time.Second) // Exponential backoff
        }
    }
    
    return lastErr
}
```

## MagnifyingGlassTiltedLeft Step 7: Service Discovery

```go
// registry/service_registry.go
package registry

import (
    "sync"
    "time"
)

type ServiceRegistry struct {
    services sync.Map  // map[string][]string
    ttl      time.Duration
}

func NewServiceRegistry(ttl time.Duration) *ServiceRegistry {
    return &ServiceRegistry{ttl: ttl}
}

// Register service
func (r *ServiceRegistry) Register(serviceName, address string) error {
    key := serviceName
    value := address
    
    // Periodic heartbeat renewal
    go func() {
        ticker := time.NewTicker(r.ttl / 2)
        defer ticker.Stop()
        
        for range ticker.C {
            r.doRegister(key, value)
        }
    }()
    
    return r.doRegister(key, value)
}

func (r *ServiceRegistry) doRegister(serviceName, address string) error {
    var addresses []string
    
    if v, ok := r.services.Load(serviceName); ok {
        addresses = v.([]string)
    }
    
    // Check if already exists
    for _, addr := range addresses {
        if addr == address {
            return nil
        }
    }
    
    addresses = append(addresses, address)
    r.services.Store(serviceName, addresses)
    
    return nil
}

// Get service addresses
func (r *ServiceRegistry) Discover(serviceName string) ([]string, error) {
    if v, ok := r.services.Load(serviceName); ok {
        return v.([]string), nil
    }
    return nil, errors.New("service not found")
}

// Load balancing (random)
func (r *ServiceRegistry) Select(serviceName string) (string, error) {
    addresses, err := r.Discover(serviceName)
    if err != nil {
        return "", err
    }
    
    // Random selection
    return addresses[rand.Intn(len(addresses))], nil
}
```

## ArtistPalette Step 8: Middleware Support

```go
// rpc/middleware.go
package rpc

type Middleware func(HandlerFunc) HandlerFunc

type HandlerFunc func(*Request, *Response) error

// Logging middleware
func LoggingMiddleware(next HandlerFunc) HandlerFunc {
    return func(req *Request, resp *Response) error {
        log.Printf("Received request: %s, Seq: %d", req.ServiceMethod, req.Seq)
        
        start := time.Now()
        err := next(req, resp)
        elapsed := time.Since(start)
        
        log.Printf("Request completed: %s, Duration: %v", req.ServiceMethod, elapsed)
        
        return err
    }
}

// Auth middleware
func AuthMiddleware(token string) Middleware {
    return func(next HandlerFunc) HandlerFunc {
        return func(req *Request, resp *Response) error {
            // Validate token
            if req.Token != token {
                return errors.New("authentication failed")
            }
            return next(req, resp)
        }
    }
}

// Rate limiting middleware
func RateLimitMiddleware(maxRequests int, window time.Duration) Middleware {
    var mu sync.Mutex
    requests := make([]time.Time, 0, maxRequests)
    
    return func(next HandlerFunc) HandlerFunc {
        return func(req *Request, resp *Response) error {
            mu.Lock()
            defer mu.Unlock()
            
            now := time.Now()
            windowStart := now.Add(-window)
            
            // Remove expired requests
            validRequests := make([]time.Time, 0)
            for _, t := range requests {
                if t.After(windowStart) {
                    validRequests = append(validRequests, t)
                }
            }
            
            if len(validRequests) >= maxRequests {
                return errors.New("too many requests")
            }
            
            requests = append(validRequests, now)
            return next(req, resp)
        }
    }
}
```

## Bug Common Issues

### 1. Connection Disconnection Handling

```go
// Heartbeat detection
func (c *Client) startHeartbeat(interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()
    
    for range ticker.C {
        if err := c.Call("Heartbeat.Ping", &struct{}{}, &struct{}{}); err != nil {
            log.Println("Heartbeat failed, reconnecting...")
            // Reconnect logic
        }
    }
}
```

### 2. Concurrency Safety

```go
// Ensure sequence number generation is thread-safe
func (c *Client) nextSeq() uint64 {
    c.mutex.Lock()
    defer c.mutex.Unlock()
    c.seq++
    return c.seq
}
```

### 3. Graceful Shutdown

```go
func (s *Server) Shutdown() {
    // Stop accepting new connections
    s.listener.Close()
    
    // Wait for existing requests to complete
    s.wg.Wait()
    
    log.Println("Server gracefully shut down")
}
```

## LightBulb Best Practices

### 1. Choose Appropriate Encoding

```go
// JSON - Human readable, cross-language
// Suitable for: debugging, cross-language calls

// Gob - Go native, efficient
// Suitable for: Go service-to-service calls

// Protobuf - Efficient, cross-language
// Suitable for: high-performance scenarios
```

### 2. Timeout Settings

```go
// Always set timeout
client.CallWithTimeout("Service.Method", args, reply, 5*time.Second)
```

### 3. Error Handling

```go
// Distinguish network errors from business errors
if err != nil {
    if isNetworkError(err) {
        // Retry
    } else {
        // Business error, don't retry
    }
}
```

### 4. Connection Pool

```go
// Reuse connections, avoid frequent creation
type ClientPool struct {
    clients chan *Client
}

func (p *ClientPool) Get() *Client {
    return <-p.clients
}

func (p *ClientPool) Put(client *Client) {
    p.clients <- client
}
```

## WhiteCheckMark Key Points Summary

- WhiteCheckMark RPC makes remote calls as simple as local ones
- WhiteCheckMark Core components: service registration, client, codec, transport
- WhiteCheckMark Support multiple encoding methods (JSON/Gob/Protobuf)
- WhiteCheckMark Timeout and retry mechanisms
- WhiteCheckMark Service discovery and load balancing
- WhiteCheckMark Middleware support (logging, auth, rate limiting)
- WhiteCheckMark Connection pool and graceful shutdown

---

**Congratulations! You have implemented a complete RPC framework!** PartyPopper

Through this hands-on project, you have mastered:
- RPC protocol design
- Network programming
- Reflection and serialization
- Concurrency control
- Error handling
- Service discovery

These are all core skills for building distributed systems!
