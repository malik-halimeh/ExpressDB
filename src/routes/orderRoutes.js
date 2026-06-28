import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';
import {
  orderCreateValidator,
  orderUpdateValidator
} from '../validators/orderValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.route('/')
  .post(orderCreateValidator, validate, createOrder)
  .get(getAllOrders);

router.route('/:id')
  .get(getOrderById)
  .put(orderUpdateValidator, validate, updateOrder)
  .delete(deleteOrder);

export default router;
