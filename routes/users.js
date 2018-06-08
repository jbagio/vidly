const { User, validate } = require('../models/user');
const ensureAuth = require('../middleware/auth');
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const router = express.Router();

/**
 * GET
 */
router.get('/me', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user._id)
    // exclude password from query
    .select('-password');
  res.send(user);
});

/**
 * POST
 */
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }
  // Check if already registered
  let user = await User.findOne({ email: req.body.email });

  if (user) {
    return res.status('400').send('Email already registered.');
  }

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  // set JSON web token in a http header
  const token = user.generateAuthToken();
  return res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;
