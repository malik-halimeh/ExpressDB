import { body } from 'express-validator';

export const menuItemCreateValidator = [
  body('item_id')
    .exists().withMessage('item_id is required')
    .isInt({ min: 1 }).withMessage('item_id must be a positive integer'),
  body('item_name')
    .exists().withMessage('item_name is required')
    .isString().withMessage('item_name must be a string')
    .trim()
    .notEmpty().withMessage('item_name cannot be empty'),
  body('price')
    .exists().withMessage('price is required')
    .isFloat({ min: 0 }).withMessage('price must be a number greater than or equal to 0'),
  body('category')
    .exists().withMessage('category is required')
    .isMongoId().withMessage('category must be a valid MongoDB ObjectId'),
  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .trim(),
  body('image_url')
    .optional()
    .isString().withMessage('image_url must be a string')
    .trim(),
  body('is_available')
    .exists().withMessage('is_available is required')
    .isBoolean().withMessage('is_available must be a boolean')
];

export const menuItemUpdateValidator = [
  body('item_name')
    .optional()
    .isString().withMessage('item_name must be a string')
    .trim()
    .notEmpty().withMessage('item_name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('price must be a number greater than or equal to 0'),
  body('category')
    .optional()
    .isMongoId().withMessage('category must be a valid MongoDB ObjectId'),
  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .trim(),
  body('image_url')
    .optional()
    .isString().withMessage('image_url must be a string')
    .trim(),
  body('is_available')
    .optional()
    .isBoolean().withMessage('is_available must be a boolean')
];
