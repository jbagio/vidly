const { User } = require('../models/user');
const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');

const router = express.Router();

/**
 * Helper function - Joi validation
 */
function validate (req) {
  const schema = {
    email: Joi.string().min(5).max(255).required()
      .email(),
    password: Joi.string().min(10).max(255).required(),
  };

  return Joi.validate(req, schema);
}

/**
 * POST
 */
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status('400').send('Invalid email or password.');
  }

  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) {
    return res.status('400').send('Invalid email or password.');
  }

  // send JSON in the response
  const token = user.generateAuthToken();
  return res.send(token);
});

module.exports = router;
