const Joi = require('joi');
const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 100
  }
});

const Genre = mongoose.model('Genre', genreSchema);

/**
 * Helper function - Joi validation
 */
function validateGenre (genre) {
  const schema = {
    name: Joi.string().min(4).max(100).required()
  };

  return Joi.validate(genre, schema);
}

exports.Genre = Genre;
exports.validate = validateGenre;
exports.genreSchema = genreSchema;
