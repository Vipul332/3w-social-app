const ApiError = require('../utils/ApiError');

/**
 * Converts thrown errors (ApiError, Mongoose errors, JSON parse errors, etc.)
 * into a consistent JSON response shape, and picks a sensible HTTP status
 * code without leaking internal implementation details to the client.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `This ${field} is already registered.`;
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier format.';
  }

  // Multer upload errors (file too large, unexpected field, etc.)
  if (err.name === 'MulterError') {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large. Maximum allowed size is 5MB.'
        : `Upload error: ${err.message}`;
  }

  if (statusCode === 500) {
    // Log full detail server-side, but never send stack traces to the client.
    console.error(err);
    message = process.env.NODE_ENV === 'production' ? 'Internal server error' : message;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Handles requests to routes that don't exist.
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
