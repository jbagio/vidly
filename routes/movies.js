const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const express = require('express');

const router = express.Router();

/**
 * GET all
 */
router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('title');
  res.send(movies);
});

/**
 * GET by id
 */
router.get('/:id', validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return res.status('404').send('Movie with the given ID was not found.');
  }
  return res.send(movie);
});

/**
 * POST
 */
router.post('/', ensureAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }
  // Check if genre exists
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) {
    return res.status('404').send('Genre with the given ID was not found.');
  }

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });

  await movie.save();

  return res.send(movie);
});

/**
 * PUT
 */
router.put('/:id', ensureAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }
  // Check if genre exists
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) {
    return res.status('404').send('Genre with the given ID was not found.');
  }
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    },
    { new: true }
  );
  if (!movie) {
    return res.status('404').send('Movie with the given ID was not found.');
  }

  return res.send(movie);
});

/**
 * DELETE
 */
router.delete('/:id', [ensureAuth, ensureAdmin, validateObjectId], async (req, res) => {
  // get deleted obj
  const movie = await Movie.findByIdAndRemove(req.params.id);
  if (!movie) {
    return res.status('404').send('Movie with the given ID was not found.');
  }

  return res.send(movie);
});

module.exports = router;
