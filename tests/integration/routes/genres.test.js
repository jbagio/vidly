const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');
const request = require('supertest');

let server;
describe('/api/genres', () => {
  // Load server before / close after test
  beforeEach(() => {
    /* eslint-disable global-require */
    server = require('../../../server');
  });
  afterEach(async () => {
    server.close();
    // Delete all test data
    await Genre.remove({});
  });
  /**
   * GET
   */
  describe('GET /', () => {
    it('should return all genres', async () => {
      // Load test data
      await Genre.insertMany([
        { name: 'genre1' },
        { name: 'genre2' }
      ]);

      const response = await request(server).get('/api/genres');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.some(genre => genre.name === 'genre1')).toBeTruthy();
      expect(response.body.some(genre => genre.name === 'genre2')).toBeTruthy();
    });
  });
  /**
   * GET by id
   */
  describe('GET /:id', () => {
    it('should return genre with the given valid id', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      const response = await request(server).get(`/api/genres/${genre.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', genre.name);
    });

    it('should return 404 if invalid genre id given', async () => {
      const response = await request(server).get('/api/genres/1');

      expect(response.status).toBe(404);
    });
  });
  /**
   * POST
   */
  describe('POST /', () => {
    let token;
    let name;

    /**
     * Happy path
     */
    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
    });

    const execRequest = () =>
      request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });

    it('should return 401 if user not authenticated', async () => {
      token = '';
      const response = await execRequest();

      expect(response.status).toBe(401);
    });

    it('should return 400 if genre name is less than 4 characters', async () => {
      name = 'aaa';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if genre name is greather than 100 characters', async () => {
      name = new Array(102).join('a');
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      const response = await execRequest();

      expect(response.status).not.toBe(null);
    });

    it('should return the genre if saved successfully', async () => {
      const response = await execRequest();

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'genre1');
    });
  });
});
