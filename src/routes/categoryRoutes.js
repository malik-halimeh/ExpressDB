import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import {
  categoryCreateValidator,
  categoryUpdateValidator
} from '../validators/categoryValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.route('/')
  .post(categoryCreateValidator, validate, createCategory)
  .get(getAllCategories);

router.route('/:id')
  .get(getCategoryById)
  .put(categoryUpdateValidator, validate, updateCategory)
  .delete(deleteCategory);

export default router;
