import express from 'express';
import {
  createOrderItem,
  getAllOrderItems,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem
} from '../controllers/orderItemController.js';
import {
  orderItemCreateValidator,
  orderItemUpdateValidator
} from '../validators/orderItemValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.route('/')
  .post(orderItemCreateValidator, validate, createOrderItem)
  .get(getAllOrderItems);

router.route('/:id')
  .get(getOrderItemById)
  .put(orderItemUpdateValidator, validate, updateOrderItem)
  .delete(deleteOrderItem);

export default router;
