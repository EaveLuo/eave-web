---
sidebar_position: 11
slug: express
title: Express framework
description: Express framework is a lightweight web application framework developed by Node.js.
tags: [Node.js, Express, backend framework]
keywords:
  - Node.js
  - Express
  - backend framework
---

Express is a concise and flexible Node.js web application framework that provides a range of powerful features for building single-page, multi-page and hybrid web applications. Express is the de facto standard for building Node.js web applications and is popular for its minimalist design and rich plugin ecosystem.

## Features

1. **Simple and easy to use**: Express provides a simple interface for defining routes, handling middleware and responding to requests.
2. **High performance**: Express is based on Node.js and uses its event-driven and non-blocking I/O model to provide high-performance web applications.
3. **Flexibility**: Express provides extremely high flexibility and can be extended and customized as needed.
4. **Middleware**: Express provides a set of middleware mechanisms that can insert custom logic at various stages of request processing.
5. **Powerful ecosystem**: Express has a large number of plugins and middlewares to enrich its functionality.

## Getting Started

Let's start with a simple Express application from 0.

### Initialize the project

Create a new directory and initialize the npm project:

```bash npm2yarn
mkdir myapp
cd myapp
npm init -y
```

Install Express:

```bash npm2yarn
npm install express
```

### Create a basic Express application

```javascript title="app.js"
const express = require('express'); // Import the Express module
const app = express(); // Create an Express application instance
const port = 8080; // Define the port that the application listens on

// Define the GET request handler for the root path
app.get('/', (req, res) => {
  res.send('Hello, World!'); // Send the response content
});

// Start the application and listen on the specified port
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`); // Output application startup information
});
```

Run the application:

```bash
node app.js
```

Visit `http://localhost:8080` in the browser, and you can see "Hello, World!".

## Routing

Routing refers to defining processing logic based on the path and method of the URL request. Express provides a variety of ways to define routes.

### Basic routing

Basic routing can handle GET, POST, PUT, and DELETE requests:

- `app.get(path, callback)`: handles GET requests.

- `app.post(path, callback)`: handles POST requests.

- `app.put(path, callback)`: handles PUT requests.

- `app.delete(path, callback)`: handles DELETE requests.

There is also a special route `app.all(path, callback)` that can handle all HTTP requests.

```javascript title="app.js"
const express = require('express'); // Import Express module
const app = express(); // Create Express application instance
const port = 8080; // Define the port that the application listens on

// highlight-start
// Define routes
app.get('/', (req, res) => {
  res.send('GET request to the homepage');
});

app.post('/', (req, res) => {
  res.send('POST request to the homepage');
});

app.put('/user', (req, res) => {
  res.send('PUT request to /user');
});

app.delete('/user', (req, res) => {
  res.send('DELETE request to /user');
});

app.all('/all', (req, res) => {
  res.send('This is a all request');
});
// highlight-end

// Start the application and listen to the specified port
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`); // Output application startup information
});
```

Run the application:

```bash
node app.js
```

At this time, it is recommended to use the [Interface Debug Tool](/docs/back-end/web-api#Interface Debug Tool) to test these routes.

- GET request, `http://localhost:8080/`: The response content is `GET request to the homepage`.
- POST request, `http://localhost:8080/`: The response content is `POST request to the homepage`.
- PUT request, `http://localhost:8080/user`: The response content is `PUT request to /user`.
- DELETE request, `http://localhost:8080/user`: the response content is `DELETE request to /user`.
- All requests, `http://localhost:8080/all`: the response content is `This is a all request`.

### Parameter routing

Parameter routing can match dynamic parameters contained in the path:

- `:param`: matches a single word.
- `:*`: matches multiple words.
- `:param?`: matches optional parameters.

```javascript title="app.js"
const express = require('express'); // Import Express module
const app = express(); // Create Express application instance
const port = 8080; // Define the port that the application listens on

// highlight-start
// Define routes
app.get('/user/:id', (req, res) => {
  console.log(req.params);
  res.send(`User ID: ${req.params.id}`);
});

app.get('/users/*', (req, res) => {
  console.log(req.params);
  res.send(`User Name: ${req.params}`);
});

app.get('/optional/:name?', (req, res) => {
  console.log(req.params);
  res.send(`Optional Name: ${req.params.name || 'Not provided'}`);
});
// highlight-end

// Start the application and listen to the specified port
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`); // Output application startup information
});
```

For the above route, you can test the following URLs. Since req.params may be an object, pay attention to the console output:

The following are all GET requests:

- `http://localhost:8080/user/123`: console output: `{ id: '123' }`, the response content is `User ID: 123`.
- `http://localhost:8080/users/eave/luo`: console output: `{ '0': 'eave/luo' }`, the response content is `User Name: eave/luo`.
- `http://localhost:8080/optional`: console output: `{ name: undefined }`, response content is `Optional Name: Not provided`.
- `http://localhost:8080/optional/eave`: console output: `{ name: 'eave' }`, response content is `Optional Name: eave`.

### Routing Group

Routing Group is a way to group related routes together, making the code more modular and easier to maintain. You can use the router (Router()) to define a route group. Here is an example:

```javascript
const express = require('express');
const app = express();
const router = express.Router();

// highlight-start
// Define a route
router.get('/', (req, res) => {
  res.send('Home Page');
});

// Define another route
router.get('/about', (req, res) => {
  res.send('About Page');
});

// Mount the route group to the application
app.use('/mygroup', router);
// highlight-end

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

In this example, we first create a `router` object, then define some routes (`/` and `/about`), and mount these routes under the `/mygroup` path of the application. Therefore, when a user visits `/mygroup` or `/mygroup/about`, the corresponding route handler will be triggered:

- GET request: `http://localhost:8080/mygroup`: The response content is `Home Page`.
- GET request: `http://localhost:8080/mygroup/about`: The response content is `About Page`.

#### Advantages of route groups

- **Modularity**: Group related routes together to make the code clearer and more modular.
- **Middleware reuse**: You can define common middleware for a group of routes without having to define it separately for each route.
- **Code organization**: Help developers better organize their code, especially when working on large projects.

By using route groups, you can better manage and maintain the routing logic of Node.js applications.

## Middleware

Middleware is a function in the request processing pipeline of an Express application. Each middleware function has access to the request object (req), the response object (res), and the next middleware function (next).

### Application-level middleware

```javascript
const express = require('express');
const app = express();
const router = express.Router();

// highlight-start
// Define an application-level middleware
app.use((req, res, next) => {
  console.log('APP defined application-level middleware');
  next();
});
// highlight-end

// Use app to define a route
app.get('/app', (req, res) => {
  res.send('APP');
});

// Use router to define a route
router.get('/test', (req, res) => {
  res.send('Router');
});

// Mount the route group to the application
app.use('/router', router);

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

After setting application-level middleware, it will be executed before all request processing after the middleware.

### Routing middleware

```javascript
const express = require('express');
const app = express();
const router = express.Router();

// highlight-start
// Define a routing middleware
router.use((req, res, next) => {
  console.log('router defined routing middleware');
  next();
});
// highlight-end

// Define a route using app
app.get('/app', (req, res) => {
  res.send('APP');
});

// Define a route using router
router.get('/test', (req, res) => {
  res.send('Router');
});

// Mount the routing group to the application
app.use('/router', router);

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

Route-level middleware will only process requests within the route group. For example, in the above example, only requests under `/router` will be processed, and requests to `http://localhost:8080/app` will not trigger route-level middleware.

### Error handling middleware

When using the Express framework for error handling in Node.js, you can define error handling middleware to capture and handle errors in your application. These middlewares are similar to ordinary middleware functions, but there is a significant difference: error handling middleware functions have four parameters `(err, req, res, next)`, where `err` is the error object.

#### Create error handling middleware

Here is a basic error handling middleware example:

```javascript
const express = require('express');
const app = express();

// Define a normal middleware
app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  next();
});

// Define a route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// highlight-start
// Define a route that will generate an error
app.get('/error', (req, res) => {
  throw new Error('This is a forced error.');
});

// Define error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: 'Something broke!' });
});
// highlight-end

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

In this example:

1. The normal middleware prints the requested URL.

2. The `/` route returns a simple "Hello World" message.

3. The `/error` route throws an error.

4. The error handling middleware catches the error and returns a 500 status code and an error message.

#### Passing errors with `next`

Sometimes you may want to catch an error and pass it to the next error handling middleware. This can be achieved by calling `next(err)`:

```javascript
app.use((req, res, next) => {
  //highlight-start
  try {
    // There may be some logic code here
    throw new Error('Something went wrong!');
  } catch (err) {
    next(err);
  }
  // highlight-end
});

app.use((err, req, res, next) => {
  // highlight-start
  console.error(err.stack);
  res.status(500).json({ code: 500, message: err.message });
  // highlight-end
});
```

#### Capturing asynchronous errors

When dealing with asynchronous operations, special attention should be paid to error handling. You can use `async/await` and `try/catch` blocks to catch asynchronous errors:

```javascript
app.get('/async-error', async (req, res, next) => {
  try {
    // simulate asynchronous operation
    await someAsyncFunction();
    res.send('Success');
  } catch (err) {
    next(err); // pass the error to the error handling middleware
  }
});
```

### Execution order of middleware

It is important to ensure that the error handling middleware is placed after all routes and other middleware. Express executes middleware in order, and only error handling middleware defined after other middleware and routes can catch errors.

By properly defining and using error handling middleware, you can effectively manage the error handling logic in your Node.js application, improve the robustness and maintainability of your application.

### Built-in middleware

Express provides some built-in middleware to help you handle common tasks. These middlewares are installed separately in Express 4.x and above, and you need to install them separately. Here are some commonly used Express built-in middlewares:

#### `express.static`

Used to serve static files such as images, CSS files, and JavaScript files.

```javascript
const express = require('express');
const app = express();

app.use(express.static('public'));

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

In this example, all files in the `public` directory can be accessed through HTTP requests.

#### `express.json`

Used to parse the incoming JSON request body. This middleware is new in Express 4.16.0.

```javascript
app.use(express.json());

app.post('/user', (req, res) => {
  res.send(req.body);
});
```

In this example, `express.json()` middleware is used to parse the JSON data contained in the POST request.

#### `express.urlencoded`

Used to parse URL-encoded data, usually used to parse data submitted by HTML forms. This middleware is new in Express 4.16.0.

```javascript
app.use(express.urlencoded({ extended: true }));

app.post('/user', (req, res) => {
  res.send(req.body);
});
```

In this example, `express.urlencoded()` middleware is used to parse the URL-encoded data contained in the POST request.

#### Using these built-in middleware

Here is an example showing how to use these built-in middleware:

```javascript
const express = require('express');
const app = express();

// Use express.static to serve static files
app.use(express.static('public'));

// Use express.json to parse JSON request body
app.use(express.json());

// Use express.urlencoded to parse URL encoded data
app.use(express.urlencoded({ extended: true }));

app.post('/user', (req, res) => {
  res.send(req.body);
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

In this example, we used `express.static` to serve static files, `express.json` and `express.urlencoded` to parse the request body data. With these built-in middleware, common web development tasks can be handled more conveniently.

## Request and Response

In Express, `req` (request object) and `res` (response object) are the core objects, which represent HTTP requests and HTTP responses respectively. They provide rich properties and methods for handling interactions between clients and servers.

### Request Object (`req`)

The request object contains all the information of the HTTP request, including request headers, request bodies, URL parameters, etc. The following are some commonly used request object properties and methods:

#### Common properties

1. **`req.params`**: An object containing route parameters.

```javascript
app.get('/user/:id', (req, res) => {
  console.log(req.params.id); // Get path parameters
});
```

2. **`req.query`**: An object containing query string parameters.

```javascript
app.get('/search', (req, res) => {
  console.log(req.query.q); // Get query parameters
});
```

3. **`req.body`**: An object containing request body data, which needs to be parsed using middleware such as `express.json()`.

```javascript
app.use(express.json());
app.post('/user', (req, res) => {
  console.log(req.body); // Get request body data
});
```

4. **`req.headers`**: An object containing request headers.

```javascript
app.get('/', (req, res) => {
  console.log(req.headers['user-agent']); // Get User-Agent header
});
```

5. **`req.method`**: HTTP request method (such as GET, POST).

```javascript
app.all('*', (req, res) => {
  console.log(req.method); // Get request method
});
```

6. **`req.url`**: The full URL of the request.

```javascript
app.get('*', (req, res) => {
  console.log(req.url); // Get request URL
});
```

7. **`req.path`**: The path part of the request.

```javascript
app.get('*', (req, res) => {
  console.log(req.path); // Get request path
});
```

#### Common methods

1. **`req.get(field)`**: Get the value of the request header.

```javascript
app.get('/', (req, res) => {
  console.log(req.get('Content-Type')); // Get Content-Type header
});
```

2. **`req.is(type)`**: Determine the type of the request body.

```javascript
app.post('/', (req, res) => {
  if (req.is('application/json')) {
    console.log('JSON request');
  }
});
```

### Response object (`res`)

The response object is used to build and send HTTP responses. Here are some common response object properties and methods:

#### Common methods

1. **`res.send(body)`**: Send the response body, which can be a string, object or buffer.

```javascript
app.get('/', (req, res) => {
  res.send('Hello World');
});
```

2. **`res.json(obj)`**: Send a JSON response.

```javascript
app.get('/user', (req, res) => {
  res.json({ name: 'John', age: 30 });
});
```

3. **`res.status(code)`**: Set the HTTP status code.

```javascript
app.get('/not-found', (req, res) => {
  res.status(404).send('Page not found');
});
```

4. **`res.redirect(url)`**: Redirect to the specified URL.

```javascript
app.get('/redirect', (req, res) => {
  res.redirect('/new-page');
});
```

5. **`res.render(view, [locals])`**: Render a view and send a response (usually used with a template engine).

```javascript
app.set('view engine', 'pug');
app.get('/home', (req, res) => {
  res.render('index', { title: 'Home' });
});
```

6. **`res.set(field, [value])`**: Set the response header.

```javascript
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('Hello World');
});
```

7. **`res.cookie(name, value, [options])`**: Set Cookie.

```javascript
app.get('/set-cookie', (req, res) => {
  res.cookie('name', 'value', { maxAge: 900000 });
  res.send('Cookie is set');
});
```

8. **`res.clearCookie(name, [options])`**: Clear Cookies.

```javascript
app.get('/clear-cookie', (req, res) => {
  res.clearCookie('name');
  res.send('Cookie is cleared');
});
```

### Comprehensive example

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = req.query.search;
  res.send(`User ID: ${userId}, Search Query: ${query}`);
});

app.post('/user', (req, res) => {
  const userData = req.body;
  res.status(201).json(userData);
});

app.get('/redirect', (req, res) => {
  res.redirect('/new-location');
});

app.get('/new-location', (req, res) => {
  res.send('You have been redirected!');
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
```

In this comprehensive example, we showed how to use various properties and methods of request and response objects to handle client requests and build server responses.

## Conclusion

Express is a powerful and flexible Node.js web application framework suitable for building various types of web applications. By understanding its routing, middleware, request and response processing, template engine and other features, developers can better use Express to build high-performance and maintainable web applications.
