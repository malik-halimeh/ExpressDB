import { body } from 'express-validator';

export const customerCreateValidator = [
  body('customer_id')
    .exists().withMessage('customer_id is required')
    .isInt({ min: 1 }).withMessage('customer_id must be a positive integer'),
  body('customer_name')
    .exists().withMessage('customer_name is required')
    .isString().withMessage('customer_name must be a string')
    .trim()
    .notEmpty().withMessage('customer_name cannot be empty'),
  body('phone_number')
    .optional()
    .isString().withMessage('phone_number must be a string')
    .trim(),
  body('address')
    .optional()
    .isString().withMessage('address must be a string')
    .trim()
];

export const customerUpdateValidator = [
  body('customer_name')
    .optional()
    .isString().withMessage('customer_name must be a string')
    .trim()
    .notEmpty().withMessage('customer_name cannot be empty'),
  body('phone_number')
    .optional()
    .isString().withMessage('phone_number must be a string')
    .trim(),
  body('address')
    .optional()
    .isString().withMessage('address must be a string')
    .trim()
];
