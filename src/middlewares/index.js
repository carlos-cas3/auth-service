/** Barrel module — re-exports all middleware functions. */
const { authenticate, authorize } = require('./authMiddleware');
const { errorHandler, notFoundHandler } = require('./errorHandler');
const { loginLimiter, generalLimiter } = require('./rateLimiter');

module.exports = {
  authenticate,
  authorize,
  errorHandler,
  notFoundHandler,
  loginLimiter,
  generalLimiter
};