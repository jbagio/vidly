const { User } = require('../../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

/**
 * User model unit tests
 */
describe('user.generateAuthToken', () => {
  it('should return a valid JSON web token', () => {
    const expectedPayload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: true
    };
    const user = new User(expectedPayload);
    const token = user.generateAuthToken();
    const payload = jwt.verify(token, config.get('jwtSecret'));

    expect(payload).toMatchObject(expectedPayload);
  });
});
