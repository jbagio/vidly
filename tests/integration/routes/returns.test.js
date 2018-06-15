const { Rental } = require('../../../models/rental');
const { Movie } = require('../../../models/movie');
const { User } = require('../../../models/user');
const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');

// POST /api/returns {customerId, movieId}

// 400 if customerId / movieId not provided
// 400 if no rental found for this customer / movie
// 400 if rental already processed
// 200 if valid request
// Set return date
// Calculate rental fee
// Increase movie stock
// Return rental

describe('/api/returns', () => {
  describe('POST /', () => {
    let server;
    let customerId;
    let movieId;
    let movie;
    let rental;
    let token;
    // Before each test, load server, generate valid token
    // and create the necessary test db data
    beforeEach(async () => {
      /* eslint-disable global-require */
      server = require('../../../server');

      token = new User().generateAuthToken();

      customerId = mongoose.Types.ObjectId();
      movieId = mongoose.Types.ObjectId();

      movie = new Movie({
        _id: movieId,
        title: 'abc',
        genre: { name: 'genre1' },
        dailyRentalRate: 2,
        numberInStock: 0
      });
      await movie.save();

      // Rental test obj
      rental = new Rental({
        customer: {
          _id: customerId,
          name: 'abc',
          phone: '12345'
        },
        movie: {
          _id: movieId,
          title: 'abc',
          dailyRentalRate: 2
        }
      });
      await rental.save();
    });
    // After each test, close server and delete all test db data
    afterEach(async () => {
      await server.close();
      await Rental.remove({});
      await Movie.remove({});
    });

    // Happy path
    const execRequest = () =>
      request(server)
        .post('/api/returns')
        .set('x-auth-token', token)
        .send({ customerId, movieId });

    it('should return 401 if user not authenticated', async () => {
      token = '';
      const result = await execRequest();

      expect(result.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
      customerId = '';
      const result = await execRequest();

      expect(result.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
      movieId = '';
      const result = await execRequest();

      expect(result.status).toBe(400);
    });

    it('should return 404 if no rental found', async () => {
      // Delete rental created at the beginning of test
      await Rental.remove({});

      const result = await execRequest();

      expect(result.status).toBe(404);
    });

    it('should return 400 if rental return date is set', async () => {
      // Set the test rental object's date
      rental.dateReturn = new Date();
      await rental.save();

      const result = await execRequest();

      expect(result.status).toBe(400);
    });

    it('should return 200 if request is valid', async () => {
      const result = await execRequest();

      expect(result.status).toBe(200);
    });

    it('should set the return date if request is valid', async () => {
      await execRequest();

      // Get test rental from the db
      const dbRental = await Rental.findById(rental._id);

      expect(dbRental.dateReturn).toBeInstanceOf(Date);
    });

    it('should set the input fee if request is valid', async () => {
      // Set the test rental object's dateRental
      rental.dateRental = moment().add(-5, 'days').toDate();
      await rental.save();

      await execRequest();

      const dbRental = await Rental.findById(rental._id);

      // Test rental obj rental fee is 2
      // So expected rentalFee is 2 * 5
      expect(dbRental.rentalFee).toBe(10);
    });

    it('should increase the movie stock by 1 if request is valid', async () => {
      await execRequest();

      const dbMovie = await Movie.findById(movieId);

      expect(dbMovie.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the updated rental if request is valid', async () => {
      const response = await execRequest();

      expect(Object.keys(response.body))
        .toEqual(expect.arrayContaining(['customer', 'movie', 'dateRental', 'dateReturn', 'rentalFee']));
    });
  });
});
