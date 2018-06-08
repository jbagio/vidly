const jwt = require('jsonwebtoken');
const config = require('config');

function ensureAuth (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const payload = jwt.verify(token, config.get('jwtSecret'));
    req.user = payload;

    return next();
  } catch (ex) {
    return res.status(400).send('Invalid token.');
  }
}

module.exports = ensureAuth;
