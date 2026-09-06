/**
 * A small typed error so controllers can throw with an explicit
 * HTTP status code, and the central error handler can respond
 * consistently without guessing.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
