import OrderItem from '../models/OrderItem.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { getPagination, getPageCount } from '../utils/pagination.js';

/**
 * Create a new OrderItem
 */
export const createOrderItem = asyncHandler(async (req, res, next) => {
  const { order, menuItem } = req.body;

  // Custom validation: Verify referenced Order exists
  const orderExists = await Order.findById(order);
  if (!orderExists) {
    throw new AppError('Referenced Order does not exist.', 400);
  }

  // Custom validation: Verify referenced MenuItem exists
  const menuItemExists = await MenuItem.findById(menuItem);
  if (!menuItemExists) {
    throw new AppError('Referenced MenuItem does not exist.', 400);
  }

  const orderItem = await OrderItem.create(req.body);
  return ApiResponse.success(res, 'Order item created successfully.', orderItem, 201);
});

/**
 * Retrieve all OrderItems with pagination
 */
export const getAllOrderItems = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const totalDocuments = await OrderItem.countDocuments();
  const data = await OrderItem.find()
    .sort({ order_item_id: 1 })
    .skip(skip)
    .limit(limit)
    .populate('order')
    .populate('menuItem');

  const totalPages = getPageCount(totalDocuments, limit);

  return ApiResponse.collection(
    res,
    'Order items retrieved successfully.',
    page,
    limit,
    totalDocuments,
    totalPages,
    data
  );
});

/**
 * Retrieve OrderItem by MongoDB ObjectId
 */
export const getOrderItemById = asyncHandler(async (req, res, next) => {
  const orderItem = await OrderItem.findById(req.params.id)
    .populate('order')
    .populate('menuItem');

  if (!orderItem) {
    throw new AppError('Order item not found.', 404);
  }

  return ApiResponse.success(res, 'Order item retrieved successfully.', orderItem);
});

/**
 * Update OrderItem by MongoDB ObjectId
 */
export const updateOrderItem = asyncHandler(async (req, res, next) => {
  const { order, menuItem } = req.body;

  // Custom validation: Verify referenced Order exists if it is being updated
  if (order) {
    const orderExists = await Order.findById(order);
    if (!orderExists) {
      throw new AppError('Referenced Order does not exist.', 400);
    }
  }

  // Custom validation: Verify referenced MenuItem exists if it is being updated
  if (menuItem) {
    const menuItemExists = await MenuItem.findById(menuItem);
    if (!menuItemExists) {
      throw new AppError('Referenced MenuItem does not exist.', 400);
    }
  }

  const orderItem = await OrderItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('order').populate('menuItem');

  if (!orderItem) {
    throw new AppError('Order item not found.', 404);
  }

  return ApiResponse.success(res, 'Order item updated successfully.', orderItem);
});

/**
 * Delete OrderItem by MongoDB ObjectId
 */
export const deleteOrderItem = asyncHandler(async (req, res, next) => {
  const orderItem = await OrderItem.findByIdAndDelete(req.params.id);
  if (!orderItem) {
    throw new AppError('Order item not found.', 404);
  }

  return ApiResponse.delete(res, 'Order item deleted successfully.');
});
