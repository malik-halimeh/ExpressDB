import AppError from '../utils/AppError.js';

/**
 * Middleware to intercept requests to unregistered pathways and throw a 404 AppError
 */
export const notFound = (req, res, next) => {
  next(new AppError('Route not found.', 404));
};

export default notFound;
