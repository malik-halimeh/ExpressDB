import { validationResult } from 'express-validator';

/**
 * Reusable validation collector middleware
 * Intercepts express-validator results and returns standard formatted error responses
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((err) => {
      // express-validator v7 uses err.path for the field name
      const field = err.path || err.param;
      formattedErrors[field] = err.msg;
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      error: formattedErrors
    });
  }
  next();
};
export default validate;
