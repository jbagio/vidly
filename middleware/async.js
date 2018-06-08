/**
 * Factory function
 * Returns the the original route handler wrapped with error handling
 * Note: express-async-errors package covers this functionality
 * So this is just a demonstration of an alternative method
 * https://nemethgergely.com/error-handling-express-async-await/
 */
// module.exports = function (handler) {
//   return async (req, res, next) => {
//     try {
//       await handler(req, res);
//     } catch (ex) {
//       // Pass exception to error middleware
//       next(ex);
//     }
//   };
// };
