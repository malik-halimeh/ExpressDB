import { body } from 'express-validator';

export const orderCreateValidator = [
  body('order_id')
    .exists().withMessage('order_id is required')
    .isInt({ min: 1 }).withMessage('order_id must be a positive integer'),
  body('customer')
    .exists().withMessage('customer is required')
    .isMongoId().withMessage('customer must be a valid MongoDB ObjectId'),
  body('order_date')
    .optional()
    .isISO8601().withMessage('order_date must be a valid ISO8601 date'),
  body('total_amount')
    .exists().withMessage('total_amount is required')
    .isFloat({ min: 0 }).withMessage('total_amount must be a number greater than or equal to 0')
];

export const orderUpdateValidator = [
  body('customer')
    .optional()
    .isMongoId().withMessage('customer must be a valid MongoDB ObjectId'),
  body('order_date')
    .optional()
    .isISO8601().withMessage('order_date must be a valid ISO8601 date'),
  body('total_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('total_amount must be a number greater than or equal to 0')
];
