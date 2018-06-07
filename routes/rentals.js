const { Rental, validate } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');

const router = express.Router();

Fawn.init(mongoose);

/**
 * GET all
 */
router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateRental');
  res.send(rentals);
});

/**
 * GET by id
 */
router.get('/:id', async (req, res) => {
  const movie = await Rental.findById(req.params.id);
  if (!movie) {
    return res.status('404').send('Rental with the given ID was not found.');
  }
  return res.send(movie);
});

/**
 * POST
 */
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }
  // Check if customer and movie exist
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) {
    return res.status('404').send('Customer with the given ID was not found.');
  }
  const movie = await Movie.findById(req.body.movieId);
  if (!customer) {
    return res.status('404').send('Movie with the given ID was not found.');
  }

  if (movie.numberInStock === 0) {
    return res.status(400).send('Movie not in stock.');
  }

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });

  // Save rental and decrease movie stock
  // Use Fawn to treat this as an atomic transaction
  try {
    new Fawn.Task()
      .save('rentals', rental)
      .update(
        'movies',
        { _id: movie._id },
        { $inc: { numberInStock: -1 } }
      )
      .run();

    return res.send(rental);
  } catch (ex) {
    return res.status(500).send('Something failed.');
  }
});

module.exports = router;
