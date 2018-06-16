const { Movie } = require('../../../models/movie');
const { User } = require('../../../models/user');
const { Genre } = require('../../../models/genre');
const request = require('supertest');
const mongoose = require('mongoose');

describe('/api/movies', () => {
  let server;
  // Before each test, load server
  beforeEach(() => {
    /* eslint-disable global-require */
    server = require('../../../server');
  });
  // After each test, close server and delete all test db data
  afterEach(async () => {
    await server.close();
    await Movie.remove({});
    await Genre.remove({});
  });

  /**
   * GET
   */
  describe('GET /', () => {
    it('should return all movies', async () => {
      // Load test data
      await Movie.insertMany([
        {
          title: 'movie1',
          genre: {
            name: 'abcd'
          },
          dailyRentalRate: 1,
          numberInStock: 1
        },
        {
          title: 'movie2',
          genre: {
            name: 'abcd'
          },
          dailyRentalRate: 1,
          numberInStock: 1
        }
      ]);

      const response = await request(server).get('/api/movies');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.some(movie => movie.title === 'movie1')).toBeTruthy();
      expect(response.body.some(movie => movie.title === 'movie2')).toBeTruthy();
    });
  });

  /**
   * GET by id
   */
  describe('GET /:id', () => {
    it('should return movie with the given id', async () => {
      const movie = new Movie({
        title: 'movie1',
        genre: {
          name: 'abcd'
        },
        dailyRentalRate: 1,
        numberInStock: 1
      });

      await movie.save();

      const response = await request(server).get(`/api/movies/${movie.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', movie.title);
    });

    it('should return 404 if given invalid id', async () => {
      const response = await request(server).get('/api/movies/1');

      expect(response.status).toBe(404);
    });

    it('should return 404 if movie with given id was not found', async () => {
      const response = await request(server).get(`/api/movies/${mongoose.Types.ObjectId()}`);

      expect(response.status).toBe(404);
    });
  });

  /**
   * POST
   */
  describe('POST /', () => {
    let token;
    let title;
    let genre;
    let genreId;
    let numberInStock;
    let dailyRentalRate;

    beforeEach(async () => {
      token = new User().generateAuthToken();

      title = 'movie1';
      numberInStock = 10;
      dailyRentalRate = 2;


      genreId = mongoose.Types.ObjectId();

      // Genre test ojb
      genre = new Genre({ _id: genreId, name: 'abcd' });
      await genre.save();
    });

    // Happy path
    const execRequest = () =>
      request(server)
        .post('/api/movies')
        .set('x-auth-token', token)
        .send({
          title,
          genreId,
          numberInStock,
          dailyRentalRate
        });

    it('should return 401 if user not authenticated', async () => {
      token = '';
      const response = await execRequest();

      expect(response.status).toBe(401);
    });

    it('should return 400 if movie title is less than 3 characters', async () => {
      title = 'aa';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if movie title is greater than 255 characters', async () => {
      title = new Array(257).join('a');
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if genreId is not provided', async () => {
      genreId = '';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if numberInStock is not provided', async () => {
      numberInStock = '';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is not provided', async () => {
      dailyRentalRate = '';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 404 if genre does not exist', async () => {
      // Delete test genre obj
      await Genre.remove({});
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should save the movie if input is valid', async () => {
      await execRequest();

      const movie = await Movie.findOne({ title });
      expect(movie).not.toBeNull();
    });

    it('should return the movie if saved successfully', async () => {
      const response = await execRequest();

      expect(Object.keys(response.body))
        .toEqual(expect.arrayContaining(['title', 'genre', 'numberInStock', 'dailyRentalRate']));
      expect(response.body.title).toBe(title);
    });
  });

  /**
   * PUT
   */
  describe('PUT /:id /', () => {
    let token;
    let updatedTitle;
    let movieId;
    let genre;
    let genreId;
    let numberInStock;
    let dailyRentalRate;


    beforeEach(async () => {
      token = new User().generateAuthToken();

      updatedTitle = 'movieAfterUpdate';
      dailyRentalRate = 2;
      numberInStock = 10;

      genreId = mongoose.Types.ObjectId();

      // Genre test ojb
      genre = new Genre({ _id: genreId, name: 'abcd' });
      await genre.save();

      // Movie to be updated test obj
      const movie = new Movie({
        title: 'movieBeforeUpdate',
        genre: {
          name: 'abcd'
        },
        dailyRentalRate: 1,
        numberInStock: 1
      });

      await movie.save();
      movieId = movie._id;
    });

    /**
     * Happy path
     */
    const execRequest = () =>
      request(server)
        .put(`/api/movies/${movieId}`)
        .set('x-auth-token', token)
        .send({
          title: updatedTitle,
          genreId,
          numberInStock,
          dailyRentalRate
        });

    it('should return 401 if user not authenticated', async () => {
      token = '';
      const response = await execRequest();

      expect(response.status).toBe(401);
    });

    it('should return 400 if movie title is less than 3 characters', async () => {
      updatedTitle = 'aa';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if movie title is greater than 255 characters', async () => {
      updatedTitle = new Array(257).join('a');
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if genreId is not provided', async () => {
      genreId = '';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if numberInStock is not provided', async () => {
      numberInStock = '';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is not provided', async () => {
      dailyRentalRate = '';
      const response = await execRequest();

      expect(response.status).toBe(400);
    });

    it('should return 404 if genre does not exist', async () => {
      // Delete test genre obj
      await Genre.remove({});
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should return 404 if movie does not exist', async () => {
      // Delete movie genre obj
      await Movie.remove({});
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should update the movie if input is valid', async () => {
      await execRequest();

      const movie = await Movie.findOne({ title: updatedTitle });
      expect(movie).not.toBeNull();
    });

    it('should return the movie if updated successfully', async () => {
      const response = await execRequest();

      expect(Object.keys(response.body))
        .toEqual(expect.arrayContaining(['title', 'genre', 'numberInStock', 'dailyRentalRate']));
      expect(response.body.title).toBe(updatedTitle);
    });
  });

  /**
   * DELETE
   */
  describe('DELETE /:id /', () => {
    let token;
    let title;
    let movieId;

    beforeEach(async () => {
      token = new User({
        isAdmin: true
      }).generateAuthToken();
      title = 'movieToDelete';

      // Movie to be updated test obj
      const movie = new Movie({
        title,
        genre: {
          name: 'abcd'
        },
        dailyRentalRate: 1,
        numberInStock: 1
      });

      await movie.save();
      movieId = movie._id;
    });

    // Happy path
    const execRequest = () =>
      request(server)
        .delete(`/api/movies/${movieId}`)
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
      movieId = 1;
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should return 404 if movie with given id was not found', async () => {
      movieId = mongoose.Types.ObjectId();
      const response = await execRequest();

      expect(response.status).toBe(404);
    });

    it('should delete the movie if input is valid', async () => {
      await execRequest();

      const movie = await Movie.findById(movieId);
      expect(movie).toBeNull();
    });

    it('should return the deleted movie if deleted successfully', async () => {
      const response = await execRequest();

      expect(response.body).toHaveProperty('_id', movieId.toHexString());
      expect(response.body.title).toBe(title);
      expect(Object.keys(response.body))
        .toEqual(expect.arrayContaining(['title', 'genre', 'numberInStock', 'dailyRentalRate']));
    });
  });
});
