const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');
const request = require('supertest');
const mongoose = require('mongoose');

describe('/api/genres', () => {
  let server;
  // Before each test, load server
  beforeEach(() => {
    /* eslint-disable global-require */
    server = require('../../../server');
  });
  // After each test, close server and delete all test db data
  afterEach(async () => {
    await server.close();
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
    it('should return genre with the given id', async () => {
      const genre = new Genre({ name: 'genre1' });
      await genre.save();

      const response = await request(server).get(`/api/genres/${genre.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', genre.name);
    });

    it('should return 404 if given invalid id', async () => {
      const response = await request(server).get('/api/genres/1');

      expect(response.status).toBe(404);
    });

    it('should return 404 if genre with given id was not found', async () => {
      const response = await request(server).get(`/api/genres/${mongoose.Types.ObjectId()}`);

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

    it('should return 400 if genre name is greater than 100 characters', async () => {
      name = new Array(102).join('a');
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should save the genre if input is valid', async () => {
      await execRequest();

      const genre = await Genre.findOne({ name });
      expect(genre).not.toBeNull();
    });

    it('should return the genre if saved successfully', async () => {
      const response = await execRequest();

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'genre1');
    });
  });

  /**
   * PUT
   */
  describe('PUT /:id /', () => {
    let token;
    let updatedName;
    let genreId;

    /**
     * Happy path
     */
    beforeEach(async () => {
      token = new User().generateAuthToken();
      updatedName = 'genreAfterUpdate';
      // Create genre to be updated
      const genre = new Genre({ name: 'genreBeforeUpdate' });
      await genre.save();
      genreId = genre._id;
    });

    const execRequest = () =>
      request(server)
        .put(`/api/genres/${genreId}`)
        .set('x-auth-token', token)
        .send({ name: updatedName });

    it('should return 401 if user not authenticated', async () => {
      token = '';
      const response = await execRequest();

      expect(response.status).toBe(401);
    });

    it('should return 400 if genre name is less than 4 characters', async () => {
      updatedName = 'aaa';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if genre name is greater than 100 characters', async () => {
      updatedName = new Array(102).join('a');
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 404 if given invalid id', async () => {
      genreId = 1;
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should return 404 if genre with given id was not found', async () => {
      genreId = mongoose.Types.ObjectId();
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should save the updated genre if input is valid', async () => {
      await execRequest();

      const genre = await Genre.findOne({ name: updatedName });
      expect(genre).not.toBeNull();
    });

    it('should return the updated genre if saved successfully', async () => {
      const response = await execRequest();

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', updatedName);
    });
  });

  /**
   * DELETE
   */
  describe('DELETE /:id /', () => {
    let token;
    let genreId;
    let name;

    /**
     * Happy path
     */
    beforeEach(async () => {
      token = new User({
        isAdmin: true
      }).generateAuthToken();
      name = 'genreToDelete';
      // Create genre to be deleted
      const genre = new Genre({ name });
      await genre.save();
      genreId = genre._id;
    });

    const execRequest = () =>
      request(server)
        .delete(`/api/genres/${genreId}`)
        .set('x-auth-token', token)
        .send();

    it('should return 401 if user not authenticated', async () => {
      token = '';
      const response = await execRequest();

      expect(response.status).toBe(401);
    });

    it('should return 403 if user not an admin', async () => {
      token = new User({
        isAdmin: false
      }).generateAuthToken();
      const response = await execRequest();

      expect(response.status).toBe(403);
    });

    it('should return 404 if given invalid id', async () => {
      genreId = 1;
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should return 404 if genre with given id was not found', async () => {
      genreId = mongoose.Types.ObjectId();
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should delete the genre if input is valid', async () => {
      await execRequest();

      const genre = await Genre.findById(genreId);
      expect(genre).toBeNull();
    });

    it('should return the deleted genre if deleted successfully', async () => {
      const response = await execRequest();

      expect(response.body).toHaveProperty('_id', genreId.toHexString());
      expect(response.body).toHaveProperty('name', name);
    });
  });
});
