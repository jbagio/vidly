const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

/**
 * Setup logging
 */
module.exports = function () {
  const databaseUri = process.env.DATABASE_URI || 'mongodb://localhost/vidlydb';

  winston.add(winston.transports.File, { filename: 'vidly_logfile.log' });
  winston.add(winston.transports.MongoDB, {
    db: databaseUri,
    level: 'error'
  });

  // Handle exceptions thrown outside of the request processing pipeline and terminate
  winston.handleExceptions(new winston.transports.File({ filename: 'vidly_uncaughtExceptions.log' }));

  // Throw unhandled rejections ensuring they're caught by winston
  process.on('unhandledRejection', (ex) => {
    throw ex;
  });
};
