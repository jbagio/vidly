const mongoose = require('mongoose');
const winston = require('winston');
const config = require('config');

/**
 * Setup database connection
 */
module.exports = function () {
  const databaseUri = config.get('databaseUri');
  mongoose.connect(databaseUri)
    .then(() => winston.info(`Connected to ${databaseUri}...`));
};
