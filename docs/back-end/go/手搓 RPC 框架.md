---
sidebar_label: 21. 手搓 RPC 框架
sidebar_position: 21
---

# 手搓 RPC 框架 - 从零实现 RPC 服务

RPC（Remote Procedure Call）是分布式系统的基石。让我们从零开始，实现一个完整的 RPC 框架。

## 📚 RPC 是什么？

RPC 让远程调用像本地函数调用一样简单：

```go
// 本地调用
result := add(1, 2)

// RPC 调用（看起来一样！）
result := client.Add(1, 2)
```

## 🎯 核心组件

一个完整的 RPC 框架包含：

1. **服务注册** - 暴露可调用的方法
2. **客户端** - 发起远程调用
3. **编码/解码** - 序列化请求和响应
4. **网络传输** - TCP/HTTP 传输数据
5. **服务发现** - 找到可用的服务

## 🚀 第一步：定义协议

```go
// rpc/protocol.go
package rpc

import "time"

// 请求
type Request struct {
    ServiceMethod string        // "Service.Method"
    Seq           uint64        // 序列号
    Args          interface{}   // 参数
}

// 响应
type Response struct {
    Seq   uint64        // 序列号（与请求对应）
    Error string        // 错误信息
    Reply interface{}   // 返回值
}

// 消息头
type Header struct {
    MagicNumber uint32        // 魔数，验证协议
    CodecType   string        // 编码方式（JSON/Gob）
    MessageType byte          // 消息类型（Request/Response）
    Seq         uint64        // 序列号
    Timeout     time.Duration // 超时时间
}

const (
    MagicNumber = 0x3bef5c
    DefaultTimeout = 10 * time.Second
)
```

## 🔧 第二步：实现编解码器

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

// JSON 编解码器
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

// Gob 编解码器（Go 原生，更高效）
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

## 🏢 第三步：实现服务端

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

// 服务实例
type Service struct {
    name    string
    rcvr    reflect.Value
    methods map[string]*MethodType
}

// 方法类型
type MethodType struct {
    method    reflect.Method
    ArgsType  reflect.Type
    ReplyType reflect.Type
}

// RPC 服务器
type Server struct {
    serviceMap sync.Map  // map[string]*Service
}

// 创建服务器
func NewServer() *Server {
    return &Server{}
}

// 注册服务
func (s *Server) Register(rcvr interface{}) error {
    serviceName := reflect.TypeOf(rcvr).Elem().Name()
    
    service := &Service{
        name:    serviceName,
        rcvr:    reflect.ValueOf(rcvr),
        methods: make(map[string]*MethodType),
    }
    
    // 遍历方法
    for m := 0; m < reflect.TypeOf(rcvr).NumMethod(); m++ {
        method := reflect.TypeOf(rcvr).Method(m)
        
        // 检查方法签名：func (T *T) Method(args *Args, reply *Reply) error
        if method.Type.NumIn() == 3 && method.Type.NumOut() == 1 {
            argsType := method.Type.In(1)
            replyType := method.Type.In(2)
            
            // 参数和返回值必须是指针
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

// 处理连接
func (s *Server) serveConn(conn io.ReadWriteCloser) {
    codec := NewGobCodec(conn)
    
    var wg sync.WaitGroup
    var seq uint64
    
    for {
        var header Header
        if err := codec.ReadHeader(&header); err != nil {
            if err != io.EOF {
                log.Println("读取消息头错误:", err)
            }
            break
        }
        
        seq = header.Seq
        
        // 查找服务
        serviceName, methodName, _ := parseServiceMethod(header.ServiceMethod)
        serviceValue, ok := s.serviceMap.Load(serviceName)
        if !ok {
            s.sendError(codec, header.Seq, fmt.Sprintf("服务不存在：%s", serviceName))
            continue
        }
        
        service := serviceValue.(*Service)
        method := service.methods[methodName]
        if method == nil {
            s.sendError(codec, header.Seq, fmt.Sprintf("方法不存在：%s", methodName))
            continue
        }
        
        // 创建参数和返回值
        argsValue := reflect.New(method.ArgsType.Elem())
        replyValue := reflect.New(method.ReplyType.Elem())
        
        // 读取参数
        if err := codec.ReadBody(argsValue.Interface()); err != nil {
            s.sendError(codec, header.Seq, err.Error())
            continue
        }
        
        // 调用方法
        wg.Add(1)
        go func() {
            defer wg.Done()
            
            errValues := method.method.Func.Call([]reflect.Value{
                service.rcvr,
                argsValue,
                replyValue,
            })
            
            // 检查错误
            var errStr string
            if !errValues[0].IsNil() {
                errStr = errValues[0].Interface().(error).Error()
            }
            
            // 发送响应
            resp := &Response{
                Seq:   header.Seq,
                Error: errStr,
                Reply: replyValue.Interface(),
            }
            
            if err := codec.Write(&Header{
                Seq: header.Seq,
            }, resp); err != nil {
                log.Println("发送响应错误:", err)
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

// 监听服务
func (s *Server) Listen(network, address string) error {
    listener, err := net.Listen(network, address)
    if err != nil {
        return err
    }
    
    log.Printf("RPC 服务器启动在 %s://%s\n", network, address)
    
    for {
        conn, err := listener.Accept()
        if err != nil {
            log.Println("接受连接错误:", err)
            continue
        }
        
        go s.serveConn(conn)
    }
}

func parseServiceMethod(serviceMethod string) (string, string, error) {
    // "Service.Method" -> "Service", "Method"
    // 实现略
    return "", "", nil
}
```

## 🖥️ 第四步：实现客户端

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

// 调用记录
type Call struct {
    Seq           uint64
    ServiceMethod string
    Args          interface{}
    Reply         interface{}
    Error         error
    Done          chan *Call
}

// RPC 客户端
type Client struct {
    codec Codec
    seq   uint64
    mutex sync.Mutex
    
    pending map[uint64]*Call
}

// 创建客户端
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
    
    // 启动接收协程
    go client.receive()
    
    return client
}

// 远程调用
func (c *Client) Call(serviceMethod string, args interface{}, reply interface{}) error {
    call := <-c.goCall(serviceMethod, args, reply, make(chan *Call, 1))
    
    if call.Error != nil {
        return call.Error
    }
    
    return nil
}

// 异步调用
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
    
    // 发送请求
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

// 接收响应
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
            log.Println("收到未知序列号的响应:", header.Seq)
            continue
        }
        
        // 读取响应
        resp := &Response{}
        if err = c.codec.ReadBody(resp); err != nil {
            call.Error = err
        } else if resp.Error != "" {
            call.Error = errors.New(resp.Error)
        } else {
            // 复制返回值
            call.Reply = resp.Reply
        }
        
        call.Done <- call
    }
    
    // 连接错误，终止所有 pending 调用
    c.mutex.Lock()
    for _, call := range c.pending {
        call.Error = err
        call.Done <- call
    }
    c.mutex.Unlock()
}

// 关闭客户端
func (c *Client) Close() error {
    return c.codec.Close()
}
```

## 📝 第五步：使用示例

```go
// 定义服务
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

// 服务端
func main() {
    server := rpc.NewServer()
    
    // 注册服务
    mathService := &MathService{}
    server.Register(mathService)
    
    // 启动监听
    server.Listen("tcp", ":8080")
}

// 客户端
func main() {
    // 连接服务器
    client, err := rpc.Dial("tcp", "localhost:8080")
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()
    
    // 调用 Add 方法
    args := &Args{A: 10, B: 20}
    reply := &Reply{}
    
    err = client.Call("MathService.Add", args, reply)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("10 + 20 = %d\n", reply.C)
    
    // 调用 Multiply 方法
    args2 := &Args{A: 5, B: 6}
    reply2 := &Reply{}
    
    err = client.Call("MathService.Multiply", args2, reply2)
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("5 * 6 = %d\n", reply2.C)
}
```

## 🚦 第六步：超时和重试

```go
// rpc/client.go 增强版
func (c *Client) CallWithTimeout(serviceMethod string, args interface{}, reply interface{}, timeout time.Duration) error {
    call := &Call{
        ServiceMethod: serviceMethod,
        Args:          args,
        Reply:         reply,
        Done:          make(chan *Call, 1),
    }
    
    // 发送请求
    c.goCall(serviceMethod, args, reply, call.Done)
    
    // 等待响应或超时
    select {
    case call = <-call.Done:
        return call.Error
    case <-time.After(timeout):
        return errors.New("调用超时")
    }
}

// 自动重试
func (c *Client) CallWithRetry(serviceMethod string, args interface{}, reply interface{}, maxRetries int) error {
    var lastErr error
    
    for i := 0; i < maxRetries; i++ {
        if err := c.Call(serviceMethod, args, reply); err == nil {
            return nil
        } else {
            lastErr = err
            time.Sleep(time.Duration(i+1) * time.Second) // 指数退避
        }
    }
    
    return lastErr
}
```

## 🔍 第七步：服务发现

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

// 注册服务
func (r *ServiceRegistry) Register(serviceName, address string) error {
    key := serviceName
    value := address
    
    // 定期心跳续期
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
    
    // 检查是否已存在
    for _, addr := range addresses {
        if addr == address {
            return nil
        }
    }
    
    addresses = append(addresses, address)
    r.services.Store(serviceName, addresses)
    
    return nil
}

// 获取服务地址
func (r *ServiceRegistry) Discover(serviceName string) ([]string, error) {
    if v, ok := r.services.Load(serviceName); ok {
        return v.([]string), nil
    }
    return nil, errors.New("服务不存在")
}

// 负载均衡（随机）
func (r *ServiceRegistry) Select(serviceName string) (string, error) {
    addresses, err := r.Discover(serviceName)
    if err != nil {
        return "", err
    }
    
    // 随机选择一个
    return addresses[rand.Intn(len(addresses))], nil
}
```

## 🎨 第八步：中间件支持

```go
// rpc/middleware.go
package rpc

type Middleware func(HandlerFunc) HandlerFunc

type HandlerFunc func(*Request, *Response) error

// 日志中间件
func LoggingMiddleware(next HandlerFunc) HandlerFunc {
    return func(req *Request, resp *Response) error {
        log.Printf("收到请求：%s, Seq: %d", req.ServiceMethod, req.Seq)
        
        start := time.Now()
        err := next(req, resp)
        elapsed := time.Since(start)
        
        log.Printf("请求完成：%s, 耗时：%v", req.ServiceMethod, elapsed)
        
        return err
    }
}

// 认证中间件
func AuthMiddleware(token string) Middleware {
    return func(next HandlerFunc) HandlerFunc {
        return func(req *Request, resp *Response) error {
            // 验证 token
            if req.Token != token {
                return errors.New("认证失败")
            }
            return next(req, resp)
        }
    }
}

// 限流中间件
func RateLimitMiddleware(maxRequests int, window time.Duration) Middleware {
    var mu sync.Mutex
    requests := make([]time.Time, 0, maxRequests)
    
    return func(next HandlerFunc) HandlerFunc {
        return func(req *Request, resp *Response) error {
            mu.Lock()
            defer mu.Unlock()
            
            now := time.Now()
            windowStart := now.Add(-window)
            
            // 移除过期请求
            validRequests := make([]time.Time, 0)
            for _, t := range requests {
                if t.After(windowStart) {
                    validRequests = append(validRequests, t)
                }
            }
            
            if len(validRequests) >= maxRequests {
                return errors.New("请求过于频繁")
            }
            
            requests = append(validRequests, now)
            return next(req, resp)
        }
    }
}
```

## 🐛 常见问题

### 1. 连接断开处理

```go
// 心跳检测
func (c *Client) startHeartbeat(interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()
    
    for range ticker.C {
        if err := c.Call("Heartbeat.Ping", &struct{}{}, &struct{}{}); err != nil {
            log.Println("心跳失败，重连...")
            // 重连逻辑
        }
    }
}
```

### 2. 并发安全

```go
// 确保序列号生成线程安全
func (c *Client) nextSeq() uint64 {
    c.mutex.Lock()
    defer c.mutex.Unlock()
    c.seq++
    return c.seq
}
```

### 3. 优雅关闭

```go
func (s *Server) Shutdown() {
    // 停止接受新连接
    s.listener.Close()
    
    // 等待现有请求处理完成
    s.wg.Wait()
    
    log.Println("服务器已优雅关闭")
}
```

## 💡 最佳实践

### 1. 选择合适的编码方式

```go
// JSON - 人类可读，跨语言
// 适合：调试、跨语言调用

// Gob - Go 原生，高效
// 适合：Go 服务间调用

// Protobuf - 高效，跨语言
// 适合：高性能场景
```

### 2. 超时设置

```go
// 总是设置超时
client.CallWithTimeout("Service.Method", args, reply, 5*time.Second)
```

### 3. 错误处理

```go
// 区分网络错误和业务错误
if err != nil {
    if isNetworkError(err) {
        // 重试
    } else {
        // 业务错误，不重试
    }
}
```

### 4. 连接池

```go
// 复用连接，避免频繁创建
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

## ✅ 知识点总结

- ✅ RPC 让远程调用像本地一样简单
- ✅ 核心组件：服务注册、客户端、编解码、传输
- ✅ 支持多种编码方式（JSON/Gob/Protobuf）
- ✅ 超时和重试机制
- ✅ 服务发现和负载均衡
- ✅ 中间件支持（日志、认证、限流）
- ✅ 连接池和优雅关闭

---

**恭喜！你已经实现了一个完整的 RPC 框架！** 🎉

通过这个实战项目，你掌握了：
- RPC 协议设计
- 网络编程
- 反射和序列化
- 并发控制
- 错误处理
- 服务发现

这些都是构建分布式系统的核心技能！
