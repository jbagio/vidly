require('dotenv').load();
require('express-async-errors');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const winston = require('winston');
require('winston-mongodb');

const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const users = require('./routes/users');
const auth = require('./routes/auth');

const error = require('./middleware/error');

const app = express();
const databaseUri = process.env.DATABASE_URI || 'mongodb://localhost/vidlydb';

winston.add(winston.transports.File, { filename: 'vidly_logfile.log' });
winston.add(winston.transports.MongoDB, {
  db: databaseUri,
  level: 'error'
});

// Handle exceptions thrown outside of the request processing pipeline and terminate
winston.handleExceptions(new winston.transports.File({ filename: 'vidly_uncaughtExceptions.log' }));

// Throw unhandled rejections ensuring they're caught by winston
process.on('unhandledRejection', (ex) => {
  throw ex;
});

// Terminate if no JSON web token secret found
if (!config.get('jwtSecret')) {
  console.log('FATAL ERROR: jwtSecret not defined.');
  process.exit(1);
}

mongoose.connect(databaseUri)
  .then(() => console.log('Connected to DB...'))
  .catch(err => console.error('Could not connect to DB...', err));

app.use(express.json());

// Routes
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);

// Error middleware
app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));
