/**
 * Send a standardized JSON response envelope.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} status - HTTP status code
 * @param {boolean} success - Whether the request succeeded
 * @param {string} message - Human-readable message
 * @param {*} [data=null] - Optional payload to include in the response
 * @returns {import('express').Response} The Express response with JSON body
 *
 * @example
 * response(res, 200, true, 'OK', { userId: 1 });
 * // => { success: true, message: "OK", data: { userId: 1 } }
 */
const response = (res, status, success, message, data = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(status).json(response);
};

module.exports = { response };