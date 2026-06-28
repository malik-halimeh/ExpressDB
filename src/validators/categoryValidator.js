import { body } from 'express-validator';

export const categoryCreateValidator = [
  body('category_id')
    .exists().withMessage('category_id is required')
    .isInt({ min: 1 }).withMessage('category_id must be a positive integer'),
  body('category_name')
    .exists().withMessage('category_name is required')
    .isString().withMessage('category_name must be a string')
    .trim()
    .notEmpty().withMessage('category_name cannot be empty'),
  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .trim()
];

export const categoryUpdateValidator = [
  body('category_name')
    .optional()
    .isString().withMessage('category_name must be a string')
    .trim()
    .notEmpty().withMessage('category_name cannot be empty'),
  body('description')
    .optional()
    .isString().withMessage('description must be a string')
    .trim()
];
