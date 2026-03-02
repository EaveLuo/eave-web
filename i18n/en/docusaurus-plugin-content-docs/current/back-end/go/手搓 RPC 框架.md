---
sidebar_label: Building RPC Framework from Scratch
sidebar_position: 21
---

# Building RPC Framework from Scratch

RPC (Remote Procedure Call) is the cornerstone of distributed systems. Let's build a complete RPC framework from scratch.

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

## Gear Step 3: Server Implementation

```go
// rpc/server.go
package rpc

import (
    "errors"
    "log"
    "net"
    "reflect"
    "sync"
)

type Server struct {
    services map[string]*service
    mu       sync.RWMutex
}

type service struct {
    name   string
    rcvr   reflect.Value
    typ    reflect.Type
    methods map[string]reflect.Method
}

func NewServer() *Server {
    return &Server{
        services: make(map[string]*service),
    }
}

// Register publishes the receiver's methods
func (s *Server) Register(rcvr interface{}) error {
    svc := &service{
        rcvr:    reflect.ValueOf(rcvr),
        typ:     reflect.TypeOf(rcvr),
        methods: make(map[string]reflect.Method),
    }
    
    svc.name = reflect.Indirect(svc.rcvr).Type().Name()
    
    // Register all exported methods
    for i := 0; i < svc.typ.NumMethod(); i++ {
        method := svc.typ.Method(i)
        svc.methods[method.Name] = method
    }
    
    s.mu.Lock()
    s.services[svc.name] = svc
    s.mu.Unlock()
    
    return nil
}

// Accept accepts connections on the listener
func (s *Server) Accept(lis net.Listener) {
    for {
        conn, err := lis.Accept()
        if err != nil {
            log.Println("rpc server: accept error:", err)
            return
        }
        go s.ServeConn(conn)
    }
}

// ServeConn handles a single connection
func (s *Server) ServeConn(conn io.ReadWriteCloser) {
    defer conn.Close()
    
    // Create codec
    codec := NewGobCodec(conn)
    
    for {
        // Read header
        var h Header
        if err := codec.ReadHeader(&h); err != nil {
            return
        }
        
        // Read request
        req := &Request{}
        if err := codec.ReadBody(req); err != nil {
            return
        }
        
        // Handle request
        go s.handleRequest(codec, &h, req)
    }
}

func (s *Server) handleRequest(codec Codec, h *Header, req *Request) {
    // Find service
    s.mu.RLock()
    svc, ok := s.services[req.ServiceMethod]
    s.mu.RUnlock()
    
    if !ok {
        s.sendResponse(codec, h, nil, errors.New("unknown service"))
        return
    }
    
    // Call method
    // ... implementation details
}

func (s *Server) sendResponse(codec Codec, h *Header, reply interface{}, err error) {
    resp := &Response{
        Seq:   h.Seq,
        Reply: reply,
    }
    if err != nil {
        resp.Error = err.Error()
    }
    
    codec.Write(h, resp)
}
```

## Satellite Step 4: Client Implementation

```go
// rpc/client.go
package rpc

import (
    "errors"
    "net"
    "sync"
)

type Client struct {
    cc       Codec
    pending  map[uint64]*Call
    seq      uint64
    mu       sync.Mutex
    closing  bool
    shutdown bool
}

type Call struct {
    ServiceMethod string
    Args          interface{}
    Reply         interface{}
    Error         error
    Done          chan *Call
}

func Dial(network, address string) (*Client, error) {
    conn, err := net.Dial(network, address)
    if err != nil {
        return nil, err
    }
    
    return NewClient(conn), nil
}

func NewClient(conn net.Conn) *Client {
    client := &Client{
        cc:      NewGobCodec(conn),
        pending: make(map[uint64]*Call),
    }
    
    go client.receive()
    
    return client
}

func (c *Client) Call(serviceMethod string, args, reply interface{}) error {
    call := <-c.Go(serviceMethod, args, reply, make(chan *Call, 1)).Done
    return call.Error
}

func (c *Client) Go(serviceMethod string, args, reply interface{}, done chan *Call) *Call {
    call := &Call{
        ServiceMethod: serviceMethod,
        Args:          args,
        Reply:         reply,
        Done:          done,
    }
    
    c.mu.Lock()
    if c.closing || c.shutdown {
        c.mu.Unlock()
        call.Error = errors.New("client closed")
        return call
    }
    
    c.seq++
    seq := c.seq
    c.pending[seq] = call
    c.mu.Unlock()
    
    // Send request
    h := &Header{
        ServiceMethod: serviceMethod,
        Seq:           seq,
    }
    
    c.cc.Write(h, args)
    
    return call
}

func (c *Client) receive() {
    for {
        // Read response
        var h Header
        if err := c.cc.ReadHeader(&h); err != nil {
            break
        }
        
        var resp Response
        if err := c.cc.ReadBody(&resp); err != nil {
            break
        }
        
        // Find pending call
        c.mu.Lock()
        call := c.pending[h.Seq]
        delete(c.pending, h.Seq)
        c.mu.Unlock()
        
        if call != nil {
            call.Error = errors.New(resp.Error)
            call.Reply = resp.Reply
            call.Done <- call
        }
    }
}
```

## Rocket Usage Example

```go
// Define service
type Calculator struct{}

func (c *Calculator) Add(args [2]int, reply *int) error {
    *reply = args[0] + args[1]
    return nil
}

// Server
func main() {
    calc := new(Calculator)
    
    server := rpc.NewServer()
    server.Register(calc)
    
    lis, _ := net.Listen("tcp", ":9999")
    server.Accept(lis)
}

// Client
func main() {
    client, _ := rpc.Dial("tcp", "localhost:9999")
    
    var reply int
    err := client.Call("Calculator.Add", [2]int{1, 2}, &reply)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Println(reply)  // 3
}
```

## LightBulb Key Insights

### 1. Protocol Design
- Magic number for validation
- Version negotiation
- Extensible headers

### 2. Serialization
- JSON for human-readable
- Gob for efficiency
- Protobuf for cross-language

### 3. Connection Management
- Connection pooling
- Heartbeat detection
- Graceful shutdown

### 4. Error Handling
- Network errors
- Timeout handling
- Retry mechanisms

## WhiteCheckMark Summary

- WhiteCheckMaster RPC core concepts
- WhiteCheckImplement codec layer
- WhiteCheckBuild server and client
- WhiteCheckHandle concurrency properly
- WhiteCheckDesign extensible protocols

---

**Next Chapter**: [Project Practice](./项目实战.md)

You will learn:
- Building complete applications
- Project structure design
- Integration testing
- Deployment strategies
