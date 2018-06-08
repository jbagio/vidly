require('dotenv').load();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');

// Routes
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const users = require('./routes/users');
const auth = require('./routes/auth');

const app = express();

// Terminate if no JSON web token secret found
if (!config.get('jwtSecret')) {
  console.log('ERROR: jwtSecret not defined.');
  process.exit(1);
}

const databaseUri = process.env.DATABASE_URI || 'mongodb://localhost/vidlydb';
mongoose.connect(databaseUri)
  .then(() => console.log('Connected to DB...'))
  .catch(err => console.error('Could not connect to DB...', err));

app.use(express.json());

app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));
