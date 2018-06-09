const config = require('config');

/**
 * Initialize config settings
 */
module.exports = function () {
  // Terminate if no JSON web token secret found
  if (!config.get('jwtSecret')) {
    throw new Error('FATAL ERROR: jwtSecret not defined.');
  }
};
