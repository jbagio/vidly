## Documentation in progress...

# Vidly
API built during [Mosh Hamedani's Node.js: The Complete Guide to Build RESTful APIs (2018) course](https://www.udemy.com/nodejs-master-class/). This API represents a fictional video rental online service, with CRUD actions for movies and genres, users sign up / sign in, registering rentals and returns.

# Key features
* Async / await syntax for all asynchronous code
* MongoDB / Mongoose
  * Transactions via Fawn
* Node.js / Express with RESTful routing
  * Request body / request params validation using Joi
* Sign up / sign in
  * bcrypt password hashing
  * JSON Web Token supplied upon sign up / sign in and used for authorisation
* Best-practices error handling
  * Express middleware to catch any error in the request processing pipeline
  * express-async-errors to patch all routes and propagate any errors to the error middleware
* Error logging to file and database logging via winston
* Unit and integration tests with Jest and Supertest

## TODO
* More tests
* Fawn on returns
* ...
