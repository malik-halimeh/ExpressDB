/**
 * Wrapper middleware to handle promises and pass errors to next() automatically
 * @param {Function} fn - Asynchronous Express middleware/controller function
 * @returns {Function} - Express route handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
