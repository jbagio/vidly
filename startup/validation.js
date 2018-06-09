const Joi = require('joi');

/**
 * Setup validation
 */
module.exports = function () {
  /* eslint-disable global-require */
  Joi.objectId = require('joi-objectid')(Joi);
};
