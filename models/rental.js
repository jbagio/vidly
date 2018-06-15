const Joi = require('joi');
const mongoose = require('mongoose');
const moment = require('moment');

const rentalSchema = new mongoose.Schema({
  // Custom customer and movie schemas to persist only the absolute essential
  // customer and movie properties when displaying a rental document
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
      },
      phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      },
      isGold: {
        type: Boolean,
        default: false
      }
    }),
    required: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
        trim: true
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
      }
    }),
    required: true
  },
  dateRental: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturn: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

/**
 * Process a rental return
 */
rentalSchema.methods.return = function () {
  this.dateReturn = new Date();

  const rentalDays = moment().diff(this.dateRental, 'days');
  this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};


const Rental = mongoose.model('Rental', rentalSchema);

/**
 * Helper function - Joi validation
 */
function validateRental (rental) {
  const schema = {
    // only customer id and movie id are sent to the api
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validateRental;
