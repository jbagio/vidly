const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

/**
 * Setup database connection
 */
module.exports = function () {
  mongoose.connect(config.get('databaseUri'))
    .then(() => winston.info('Connected to DB...'));
};
