const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const { ensureAuth } = require('../middleware/auth');
const moment = require('moment');
const express = require('express');

const router = express.Router();

/**
 * Post
 */
router.post('/', ensureAuth, async (req, res) => {
  if (!req.body.customerId) {
    return res.status(400).send('customerId not provided.');
  }

  if (!req.body.movieId) {
    return res.status(400).send('movieId not provided.');
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

  rental.dateReturn = new Date();

  const rentalDays = moment().diff(rental.dateRental, 'days');
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;

  await rental.save();

  await Movie.update(
    { _id: rental.movie._id },
    { $inc: { numberInStock: 1 } }
  );

  return res.status(200).send(rental);
});

module.exports = router;
