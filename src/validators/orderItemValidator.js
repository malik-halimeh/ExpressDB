import { body } from 'express-validator';

export const orderItemCreateValidator = [
  body('order_item_id')
    .exists().withMessage('order_item_id is required')
    .isInt({ min: 1 }).withMessage('order_item_id must be a positive integer'),
  body('order')
    .exists().withMessage('order is required')
    .isMongoId().withMessage('order must be a valid MongoDB ObjectId'),
  body('menuItem')
    .exists().withMessage('menuItem is required')
    .isMongoId().withMessage('menuItem must be a valid MongoDB ObjectId'),
  body('quantity')
    .exists().withMessage('quantity is required')
    .isInt({ min: 1 }).withMessage('quantity must be an integer greater than zero'),
  body('unit_price')
    .exists().withMessage('unit_price is required')
    .isFloat({ min: 0 }).withMessage('unit_price must be a number greater than or equal to 0')
];

export const orderItemUpdateValidator = [
  body('order')
    .optional()
    .isMongoId().withMessage('order must be a valid MongoDB ObjectId'),
  body('menuItem')
    .optional()
    .isMongoId().withMessage('menuItem must be a valid MongoDB ObjectId'),
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('quantity must be an integer greater than zero'),
  body('unit_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('unit_price must be a number greater than or equal to 0')
];
