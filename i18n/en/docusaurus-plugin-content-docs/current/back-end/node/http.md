---
sidebar_position: 8
slug: http
title: http module
description: The http module is one of the core modules of Node.js, used to create and serve HTTP servers.
tags: [Node.js, http]
keywords:
  - Node.js
  - http
---

Before introducing the `http` module, let's first understand the HTTP protocol, which will help us use the `http` module in Node.js.

## HTTP protocol

HTTP (HyperText Transfer Protocol) is a standard protocol for transmitting hypertext between web browsers and web servers. It is the basic protocol for web applications and defines how resources (such as HTML documents, images, videos, etc.) are requested and transmitted between clients (usually browsers) and servers. Here are some key concepts and details of the HTTP protocol:

### Basic working principle of HTTP

HTTP is a stateless, application-layer protocol based on a request-response model. The client sends an HTTP request to the server, and the server processes the request and returns an HTTP response.

#### Request-Response Model

- **Client**: Sends HTTP requests to the server. Usually a browser, but can be other types of clients such as mobile applications or crawlers.

- **Server**: Receives and processes the client's request and returns an HTTP response.

#### Statelessness

HTTP is a stateless protocol, which means that each request is independent and the server does not keep any state about the client. Each request contains all the information needed to complete the request.

### HTTP Request

HTTP requests consist of three main parts: the request line, the request header, and the request body.

#### Request Line

The request line contains three parts: the HTTP method, the request target (usually a URL), and the HTTP version.

```plaintext
GET /index.html HTTP/1.1
```

- **HTTP Method**: Specifies the type of request. Common methods include:

- `GET`: Request a resource.

- `POST`: Submit data to the server.

- `PUT`: Update a resource.

- `DELETE`: delete the resource.
- `HEAD`: request the header information of the resource.
- `OPTIONS`: ask the server for supported HTTP methods.
- `PATCH`: make partial modifications to the resource.

- **Request target**: usually the path or URL of the resource.

- **HTTP version**: specifies the version of the HTTP protocol. Common versions are HTTP/1.0, HTTP/1.1 and HTTP/2.

#### Request header

The request header contains multiple header fields, each of which contains a key and a value to pass additional information.

```plaintext
Host: www.eaveluo.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
```

Common request header fields include:

- `Host`: specifies the host name and port number of the request.
- `User-Agent`: contains information about the client (such as browser type and version).
- `Accept`: specifies the media types acceptable to the client.
- `Content-Type`: indicates the media type of the request body (such as `application/json`).

#### Request Body

The request body contains the data sent by the client to the server, usually for `POST` or `PUT` requests. For example, submitting form data or uploading a file.

### HTTP Response

The HTTP response also consists of three main parts: status line, response headers, and response body.

#### Status Line

The status line consists of three parts: HTTP version, status code, and status phrase.

```plaintext
HTTP/1.1 200 OK
```

- **HTTP version**: Specifies the version of the HTTP protocol.

- **Status code**: A three-digit number indicating the result of the response. Common status codes include:

- `200 OK`: The request was successful.

- `301 Moved Permanently`: The resource has been permanently moved to a new location.

- `404 Not Found`: The requested resource does not exist.

- `500 Internal Server Error`: An internal server error.

- **Status phrase**: A brief description of the status code.

#### Response Header

The response header contains multiple header fields, each of which contains a key and a value to pass additional information.

```plaintext
Content-Type: text/html; charset=UTF-8
Content-Length: 138
```

Common response header fields include:

- `Content-Type`: Indicates the media type and character set of the response body.
- `Content-Length`: Indicates the length of the response body in bytes.
- `Set-Cookie`: Sets cookies.

#### Response Body

The response body contains the data returned by the server to the client, such as HTML documents, images, videos, etc.

### HTTP Version

#### HTTP/1.0

- Each request/response pair uses a separate TCP connection.
- Persistent connections are not possible.

#### HTTP/1.1

- Introduced persistent connections, allowing multiple requests and responses to be made on a single TCP connection.
- Supports chunked transfer encoding.
- More cache control mechanisms are introduced.

#### HTTP/2

- Multiplexing: Multiple requests and responses can be processed in parallel on a TCP connection.

- Header compression: Reduce the size of request and response headers.

- Server push: The server can actively send resources to the client.

### HTTPS

HTTPS (HyperText Transfer Protocol Secure) is a secure version of HTTP. It encrypts communications through TLS (Transport Layer Security) or SSL (Secure Sockets Layer) to ensure data confidentiality and integrity.

In summary, the HTTP protocol is one of the most widely used protocols on the Internet, supporting communication between web browsers and servers. With the upgrade of versions, performance and security are constantly improving.

## http module

The `http` module in Node.js is the core module for creating HTTP servers and clients. It provides some methods and classes for processing HTTP requests and responses, making it easier to build network applications in the Node.js environment. Here are some key components and usage of the `http` module:

### Import the `http` module

To use the `http` module, you need to import it first:

```javascript
const http = require('http');
```

### Create an HTTP server

Use the `http` module to create an HTTP server that can listen to a specific port and handle client requests.

```javascript
const http = require('http');

// Create a server
const server = http.createServer((request, response) => {
  // Response content
  response.end('Hello, http!\n');
});

// Server listens on port 8080
server.listen(8080, () => {
  console.log('The server is running at http://127.0.0.1:8080/');
});
```

- `http.createServer(callback)`: Create a new HTTP server and call the `callback` function when a request arrives.

- `request` (request object): Contains information about the client request (e.g., HTTP method, request URL, header information, etc.).

- `response` (response object): Used to send a response to the client.

Run the server using the command `node filename`.

```bash
$ node test.js
```

At this time, if you visit `http://127.0.0.1:8080/`, you will see that the response content returned by the server is garbled.

![202407101116370](https://tecent-oss-shanghai.eaveluo.com/img/202407101116370.png?imageSlim)

This is because the browser uses an encoding method that does not support Chinese characters by default, resulting in garbled Chinese content. The solution is to set the `Content-Type` field in the response header.

```javascript
const http = require('http');

// Create a server
const server = http.createServer((request, response) => {
  // highlight-start
  // Set the Content-Type field of the response header
  response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  // highlight-end
  // Response content
  response.end('Hello, http!\n');
});

// Server listens on port 8080
server.listen(8080, () => {
  console.log('The server is running at http://127.0.0.1:8080/');
});
```

Run the server again and visit `http://127.0.0.1:8080/`. You can see that the response content displayed by the browser is normal.

![202407101116564](https://tecent-oss-shanghai.eaveluo.com/img/202407101116564.png?imageSlim)

### Manually shut down the HTTP server

After the service is started, the updated code `must restart the service to take effect`.

Press the `Ctrl + C` key combination to manually shut down the HTTP server.

### Port occupation problem

If the port number is occupied, it will prompt `listen EADDRINUSE: address already in use 127.0.0.1:8080`.

Solution:

- Kill the process occupying the port.

- Try other port numbers **(recommended)**.

### Get HTTP request message / set HTTP response message

The `request` object provides some methods and properties for getting HTTP request messages.

- `request.url`: Get the requested URL.
- `request.method`: Get the request method.
- `request.headers`: Get the request header information.
- `request.on('data', callback)`: Listen for data stream events.
- `request.on('end', callback)`: Listen for data stream end events.
- `request.httpVersion`: Get the HTTP version.

The `response` object provides some methods and properties for setting HTTP response messages.

- `response.write(data)`: Write data to the response body.
- `response.end(data)`: End the response and optionally write data.
- `response.setHeader(name, value)`: Set the response header field.
- `response.statusCode`: Set the response status code.
- `response.statusMessage`: Set the response status phrase **(This has a default value and is generally not set)**.

The following simulates a simple login and registration page, and returns different response contents according to the requested URL and method.

:::tip Tips

Currently only introduces
For simple usage, in order to facilitate the effect, the method here uses GET request (the browser sends GET request by default. If you want to send POST request, you need to set the `Content-Type` field in the request header). It will be introduced in detail later when the interface is developed.

:::

```javascript
const http = require('http');

// Create a server
const server = http.createServer((request, response) => {
  let { url, method } = request; // Object deconstruction assignment
  // Set response header information
  // Solve Chinese garbled characters
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (url == '/register' && method == 'GET') {
    response.end('Registration page');
  } else if (url == '/login' && method == 'GET') {
    response.end('Login page');
  } else {
    response.end('<h1>404 Not Found</h1>');
  }
});

// Server listens to port 8080
server.listen(8080, () => {
  console.log('Server is running on http://127.0.0.1:8080/');
});
```

Run the server, visit `http://127.0.0.1:8080/register` and `http://127.0.0.1:8080/login`, and you can see different response contents.

- 404 Not Found: The requested URL is `/`, so the 404 page is returned.
  ![202407101207593](https://tecent-oss-shanghai.eaveluo.com/img/202407101207593.png?imageSlim)

- Registration page: The requested URL is `/register`, and the request method is `GET`, so the registration page is returned.
  ![202407101208357](https://tecent-oss-shanghai.eaveluo.com/img/202407101208357.png?imageSlim)

- Login page: The requested URL is `/login` and the request method is `GET`, so the login page is returned.
  ![202407101208714](https://tecent-oss-shanghai.eaveluo.com/img/202407101208714.png?imageSlim)
