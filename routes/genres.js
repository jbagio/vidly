const { Genre, validate } = require('../models/genre');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

/**
 * GET all
 */
router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.send(genres);
});

/**
 * GET by id
 */
router.get('/:id', async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) {
    return res.status('404').send('Genre with the given ID was not found.');
  }

  return res.send(genre);
});

/**
 * POST
 */
router.post('/', ensureAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }

  const genre = new Genre({ name: req.body.name });

  await genre.save();

  return res.send(genre);
});

/**
 * PUT
 */
router.put('/:id', ensureAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );
  if (!genre) {
    return res.status('404').send('Genre with the given ID was not found.');
  }

  return res.send(genre);
});

/**
 * DELETE
 */
router.delete('/:id', [ensureAuth, ensureAdmin], async (req, res) => {
  // get deleted obj
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) {
    return res.status('404').send('Genre with the given ID was not found.');
  }

  return res.send(genre);
});

module.exports = router;
