---
sidebar_position: 2
slug: web-api
title: Application Programming Interface (API)
description: Web API is an application programming interface provided over the network, allowing different software systems to communicate and exchange data over the Internet.
tags: [backend, api]
keywords:
  - backend
  - api
---

Web API is an application programming interface provided over the network, allowing different software systems to communicate and exchange data over the Internet. Web API usually uses HTTP or HTTPS protocol and can be called by various clients (such as web browsers, mobile applications, desktop applications, etc.) to access and operate resources or services on the server.

## Features of Web API

1. **Based on HTTP/HTTPS protocol**: Web API uses HTTP or HTTPS as the communication protocol to facilitate data transmission over the Internet.
2. **Support multiple data formats**: Web API usually supports multiple data formats, the most common of which are JSON and XML, which are easy to parse and process.
3. **Stateless communication**: Each request is independent, and the server does not need to remember the previous request status. Each request contains all the necessary information.
4. **Cross-platform**: Due to the use of standard HTTP/HTTPS protocols and common data formats, Web APIs can interact between different operating systems and programming languages.

## Types of Web APIs

Currently mainstream Web APIs can be divided into the following categories:

1. **RESTful API**: Web API that follows the REST architectural style.
2. **SOAP API**: Web API that follows the SOAP protocol.
3. **GraphQL API**: Web API that follows the GraphQL protocol.
4. **RPC API**: Web API that follows the RPC protocol.

### RPC API

RPC (Remote Procedure Call) is a protocol for calling remote services over the network.

#### Features of RPC API:

- **Based on RPC protocol**: Use RPC protocol as the communication protocol.
- **Stateless communication**: The server does not save the client's state, all state information is saved by the client and passed on each request.
- **Support multiple data formats**: Support multiple data formats, such as JSON, XML, binary, etc.

#### Example:

Example of calling a remote service:

```
POST /rpc HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
"method": "getUser",
"params": [123],
"id": 1
}
```

### SOAP API

SOAP (Simple Object Access Protocol) is an XML-based protocol for exchanging structured information on the Internet.

#### Features of SOAP API:

- **Based on XML**: Use XML as the message format.
- **Strict standards**: Including security, transaction processing, etc.
- **More complex**: Compared with REST, SOAP is more complex to implement and parse.

#### Example:

SOAP request example (simplified version):

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:example">
<soapenv:Header/>
<soapenv:Body>
<urn:GetUser>
<urn:UserId>123</urn:UserId>
</urn:GetUser>
</soapenv:Body>
</soapenv:Envelope>
```

### GraphQL API

GraphQL (Graph Query Language) is a query language for APIs.

#### Features of GraphQL API:

- **Based on GraphQL protocol**: Use GraphQL protocol as the communication protocol.

- **Strong type system**: GraphQL has a strong type system that makes it easy to define data models.
- **More flexible**: GraphQL allows the client to specify the data it needs, which allows for more flexible data retrieval.

#### Example:

GraphQL request example (simplified version):

```graphql
query {
  user(id: 123) {
    id
    name
    email
  }
}
```

### RESTful API

REST (Representational State Transfer) is an architectural style that emphasizes resource representation and state transition. RESTful API is a Web API that follows the REST architectural style.

#### Features of RESTful API:

- **Resource-oriented**: Each resource is uniquely identified by a URL.

- **Use standard HTTP methods**: such as GET, POST, PUT, DELETE, etc.

- **Stateless communication**: The server does not save the client's state, all state information is saved by the client and passed on each request.

- **Support multiple data formats**: The most commonly used is JSON.

Since RESTful API is the most popular type of Web API, the following briefly introduces the REST principles followed by RESTful API.

#### REST principles followed by RESTful API:

- **Protocol**

RESTful API uses HTTP protocol as the communication protocol, such as GET, POST, PUT, DELETE.

- **Domain name**

RESTful API should try to use a dedicated domain name, such as api.eaveluo.com.

If it is determined that the API is very simple and will not be further expanded, you can consider putting it under the main domain name, such as eaveluo.com/api.

- **Version**

RESTful API should have a version number, such as api.eaveluo.com/v1.

- **Path**

RESTfulRESTful API uses nouns to represent resources and verbs to represent operations, such as /users, /users/:id.

- **HTTP verbs**

RESTful API uses HTTP verbs to represent operations, such as GET, POST, PUT, and DELETE.

- GET: Get resources.
- POST: Create resources.
- PUT: Update resources.
- DELETE: Delete resources.

- **Filtering**

If there are a lot of records, the server cannot return them all to the user. The API should provide parameters to filter the returned results.

Here are some common parameters:

- ?limit=10: Specify the number of records to return
- ?page=8$limit=10: Specify the page number and the number of records per page.
- ?sortby=name&order=asc: Specify which attribute to sort the returned results by, and the sorting order.
- ?name=Eave Luo: Specify the filtering criteria

- **Status code**

The status codes and prompts returned by the server to the user are the following:

- 200 OK: The request was successful.
- 201 Created: The resource was created successfully.
- 204 No Content: The request was successful, but no content was returned.
- 400 Bad Request: The request syntax is incorrect.
- 401 Unauthorized: The request is not authorized.
- 403 Forbidden: The server rejected the request.
- 404 Not Found: The requested resource does not exist.
- 500 Internal Server Error: Internal server error.

- **Error handling**

If the status code is 4xx, an error message should be returned to the user. Generally speaking, the error is used as the key name and the error message is used as the key value in the returned information.

Example:

```json
{
  "error": "User not found"
}
```

- **Return result**

The result returned by the server to the user should conform to the format defined in the API documentation.

Example:

```json
[
  {
    "id": 1,
    "name": "Eave Luo",
    "email": "hi@eaveluo.com"
  },
  {
    "id": 2,
    "name": "Admin",
    "email": "admin@eaveluo.com"
  }
]
```

#### Example:

Get all users:

```http
GET /users
Host: api.eaveluo.com
```

Create a new user:

```http
POST /users
Host: api.eaveluo.com
Content-Type: application/json

{
"name": "Eave Luo",
"email": "hi@eaveluo.com"
}
```

## Advantages of Web API

1. **Cross-platform**: Can communicate between different platforms and programming languages.
2. **Flexibility**: It can be used in various application scenarios, such as web applications, mobile applications, desktop applications, etc.
3. **Extensibility**: New endpoints and functions can be added as needed.
4. **Easy to integrate**: It uses standard HTTP protocol and common data format, which is easy to integrate with other systems.

## Application scenarios of Web API

1. **Web services**: Provide backend services such as user management, order processing, etc. through Web API.
2. **Mobile applications**: Mobile applications can communicate with backend servers through Web API to obtain and submit data.
3. **Third-party integration**: Allow third-party developers to access and use your system functions, such as payment gateways, social media APIs, etc.
4. **Internet of Things**: IoT devices can exchange data and remotely control with servers through Web API.

## Build a simple RESTful Web API example (using Node.js)

Here is a simple RESTful Web API example built with Node.js and the Express framework:

### Install Express

```bash
npm install express
```

### Create a simple RESTful API

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let users = [
  { id: 1, name: 'Eave Luo', email: 'hi@eaveluo.com' },
  { id: 2, name: 'Admin', email: 'admin@eaveluo.com' },
];

// Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Get the user with the specified ID
app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

// Create a new user
app.post('/users', (req, res) => {
  const user = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email,
  };
  users.push(user);
  res.status(201).json(user);
});

// Update the user with the specified ID
app.put('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');

  user.name = req.body.name;
  user.email = req.body.email;
  res.json(user);
});

// Delete the user with the specified ID
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).send('User not found');

  users.splice(userIndex, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
```

This simple example shows how to create a basic RESTful Web API using Node.js and the Express framework, including basic CRUD (create, read, update, delete) operations.

## Interface debugging tool

There are many tools that can be used to debug Web APIs, such as Postman, ApiFox, etc. Here are some commonly used interface debugging tools.

- **Postman**: Postman is an open source API debugging tool that can be used to test Web APIs. Official website: https://www.postman.com/.
- **ApiFox**: An integrated collaborative platform for API design, development, and testing. APIfox = Postman + Swagger + Mock + JMeter. Official website: https://apifox.com/.
