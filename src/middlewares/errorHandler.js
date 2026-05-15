const { HTTP_STATUS } = require('../models/types');

const errorHandler = (err, req, res, next) => {
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

const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found'
  });
};

module.exports = { errorHandler, notFoundHandler };