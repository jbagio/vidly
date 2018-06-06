const express = require('express');
const Joi = require('joi');

const router = express.Router();

// Temp placeholder values
const genres = [
  { id: 1, name: 'Comedy' },
  { id: 2, name: 'Action' },
  { id: 3, name: 'Horror' }
];

/**
 * Helper function - Joi validation
 */
function validateGenre (genre) {
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(genre, schema);
}

/**
 * GET all
 */
router.get('/', (req, res) => {
  res.send(genres);
});

/**
 * GET by id
 */
router.get('/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id, 10));
  if (!genre) { // 404 not found
    return res.status('404').send('Genre with the given ID not found.');
  }
  return res.send(genre);
});

/**
 * POST
 */
router.post('/', (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) {
    // invalid request
    return res.status('400').send(error.details[0].message);
  }

  const genre = {
    id: parseInt(genres[genres.length - 1].id, 10) + 1,
    name: req.body.name
  };
  genres.push(genre);
  return res.send(genre);
});

/**
 * PUT
 */
router.put('/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id, 10));
  if (!genre) { // 404 not found
    return res.status('404').send('Genre with the given ID not found.');
  }

  const { error } = validateGenre(req.body);
  if (error) {
    // invalid request
    return res.status('400').send(error.details[0].message);
  }

  // Update genre
  genre.name = req.body.name;
  return res.send(genre);
});

/**
 * DELETE
 */
router.delete('/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id, 10));
  if (!genre) { // 404 not found
    return res.status('404').send('Genre with the given ID not found.');
  }

  // Delete from array
  const index = genres.indexOf(genre);
  genres.splice(index, 1);

  return res.send(genre);
});

module.exports = router;
