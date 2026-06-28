import AppError from '../utils/AppError.js';

/**
 * Formats Mongoose ObjectId CastErrors into user-friendly responses
 */
const handleCastErrorDB = () => {
  return new AppError('Invalid resource identifier.', 400);
};

/**
 * Formats MongoDB index duplicate key violations (11000)
 */
const handleDuplicateKeyDB = (err) => {
  let message = 'Duplicate key value entered.';
  if (err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    // Clean up snake_case database field names to readable field names
    const formattedField = field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    message = `${formattedField} already exists.`;
  }
  return new AppError(message, 409);
};

/**
 * Formats Mongoose model schema validation failures
 */
const handleValidationErrorDB = (err) => {
  const errors = {};
  Object.values(err.errors).forEach((el) => {
    errors[el.path] = el.message;
  });
  
  const error = new AppError('Validation failed.', 400);
  error.errors = errors;
  return error;
};

/**
 * Central Express global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;
  error.errors = err.errors;
  error.keyValue = err.keyValue;

  if (err.name === 'CastError') error = handleCastErrorDB();
  if (err.code === 11000) error = handleDuplicateKeyDB(error);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

  const response = {
    success: false,
    message: error.message || 'Unexpected server error.'
  };

  // Attach error details (validation errors or custom structures)
  if (error.errors) {
    response.error = error.errors;
  } else if (err.errors) {
    response.error = err.errors;
  }

  // Under development, include stack trace for non-operational errors
  if (process.env.NODE_ENV === 'development' && !error.isOperational) {
    response.stack = err.stack;
  }

  res.status(error.statusCode || err.statusCode).json(response);
};

export default errorHandler;
