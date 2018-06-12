const mongoose = require('mongoose');

/**
 * Middleware function to validate mongoose id
 */
module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status('404').send('Invalid ID.');
  }
  return next();
};
