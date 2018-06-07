const express = require('express');
const mongoose = require('mongoose');

// Routes
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');

const app = express();

const databaseUri = process.env.DATABASE_URI || 'mongodb://localhost/vidlydb';
mongoose.connect(databaseUri)
  .then(() => console.log('Connected to DB...'))
  .catch(err => console.error('Could not connect to DB...', err));

app.use(express.json());

app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));
