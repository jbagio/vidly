const { User } = require('../../../models/user');
const { ensureAuth } = require('../../../middleware/auth');
const mongoose = require('mongoose');

/**
 * Auth middleware functions unit tests
 */
describe('auth middleware functions', () => {
  describe('ensureAuth', () => {
    it('should populate req.user with the valid JSON web token payload', () => {
      const expectedPayload = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        isAdmin: true
      };
      const token = new User(expectedPayload).generateAuthToken();

      // Mock functions
      const req = { header: jest.fn().mockReturnValue(token) };
      const next = jest.fn();

      const res = {};

      ensureAuth(req, res, next);

      expect(req.user).toMatchObject(expectedPayload);
    });
  });
});
