const { User } = require('../../../models/user');
const { Genre } = require('../../../models/genre');
const request = require('supertest');

let server;
let token;
describe('auth middleware functions', () => {
  // Before each test, load server and generate valid token
  beforeEach(() => {
    /* eslint-disable global-require */
    server = require('../../../server');
    token = new User().generateAuthToken();
  });
  // After each test, close server and delete all test db data
  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  describe('ensureAuth', () => {
    // Happy path
    const execRequest = async () =>
      request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: 'genre1' });

    it('should return 401 if no token provided', async () => {
      token = '';
      const response = await execRequest();

      expect(response.status).toBe(401);
    });

    it('should return 400 if invalid token provided', async () => {
      token = 'a';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 200 if valid token provided', async () => {
      const response = await execRequest();

      expect(response.status).toBe(200);
    });
  });
});
