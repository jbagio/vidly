const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { ensureAuth } = require('../middleware/auth');
const express = require('express');

const router = express.Router();

/**
 * Post
 */
router.post('/', ensureAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }

  const rental = await Rental.findOne({
    'customer._id': req.body.customerId,
    'movie._id': req.body.movieId
  });
  if (!rental) {
    return res.status(404).send('Rental with the given customer ID and movie ID was not found.');
  }

  if (rental.dateReturn) {
    return res.status(400).send('Rental already processed.');
  }

  rental.return();

  await rental.save();

  await Movie.update(
    { _id: rental.movie._id },
    { $inc: { numberInStock: 1 } }
  );

  return res.send(rental);
});

module.exports = router;
