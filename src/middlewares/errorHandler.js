const { HTTP_STATUS } = require('../models/types');

/**
 * Global Express error handler (4-argument middleware).
 * Logs the error and returns a JSON error envelope.
 * In production, 500-level errors return a generic message to avoid leaking details.
 *
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 *
 * @example
 * // In a controller:
 * throw new Error("Something went wrong");
 * // or set err.statusCode = 400 before throwing
 */
const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  const status = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status === HTTP_STATUS.INTERNAL_ERROR
      ? 'Internal server error'
      : message
  });
};

/**
 * Catch-all middleware for unmatched routes. Returns a 404 JSON response.
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found'
  });
};

module.exports = { errorHandler, notFoundHandler };