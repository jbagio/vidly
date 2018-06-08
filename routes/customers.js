const { Customer, validate } = require('../models/customer');
const ensureAuth = require('../middleware/auth');
const express = require('express');

const router = express.Router();

/**
 * GET all
 */
router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

/**
 * GET by id
 */
router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status('404').send('Customer with the given ID was not found.');
  }
  return res.send(customer);
});

/**
 * POST
 */
router.post('/', ensureAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }

  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold
  });

  await customer.save();

  return res.send(customer);
});

/**
 * PUT
 */
router.put('/:id', ensureAuth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status('400').send(error.details[0].message);
  }
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold
    },
    { new: true }
  );
  if (!customer) {
    return res.status('404').send('Customer with the given ID was not found.');
  }

  return res.send(customer);
});

/**
 * DELETE
 */
router.delete('/:id', ensureAuth, async (req, res) => {
  // get deleted obj
  const customer = await Customer.findByIdAndRemove(req.params.id);
  if (!customer) {
    return res.status('404').send('Customer with the given ID was not found.');
  }

  return res.send(customer);
});

module.exports = router;
