import express from 'express';
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuItemController.js';
import {
  menuItemCreateValidator,
  menuItemUpdateValidator
} from '../validators/menuItemValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.route('/')
  .post(menuItemCreateValidator, validate, createMenuItem)
  .get(getAllMenuItems);

router.route('/:id')
  .get(getMenuItemById)
  .put(menuItemUpdateValidator, validate, updateMenuItem)
  .delete(deleteMenuItem);

export default router;
