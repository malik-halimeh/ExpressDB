import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import OrderItem from '../models/OrderItem.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { getPagination, getPageCount } from '../utils/pagination.js';

/**
 * Create a new Order
 */
export const createOrder = asyncHandler(async (req, res, next) => {
  const { customer } = req.body;

  // Custom validation: Verify referenced Customer exists
  const customerExists = await Customer.findById(customer);
  if (!customerExists) {
    throw new AppError('Referenced Customer does not exist.', 400);
  }

  const order = await Order.create(req.body);
  return ApiResponse.success(res, 'Order created successfully.', order, 201);
});

/**
 * Retrieve all Orders with pagination
 */
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const totalDocuments = await Order.countDocuments();
  const data = await Order.find()
    .sort({ order_date: -1 })
    .skip(skip)
    .limit(limit)
    .populate('customer');

  const totalPages = getPageCount(totalDocuments, limit);

  return ApiResponse.collection(
    res,
    'Orders retrieved successfully.',
    page,
    limit,
    totalDocuments,
    totalPages,
    data
  );
});

/**
 * Retrieve Order by MongoDB ObjectId
 */
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('customer');
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  return ApiResponse.success(res, 'Order retrieved successfully.', order);
});

/**
 * Update Order by MongoDB ObjectId
 */
export const updateOrder = asyncHandler(async (req, res, next) => {
  const { customer } = req.body;

  // Custom validation: Verify referenced Customer exists if it is being updated
  if (customer) {
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      throw new AppError('Referenced Customer does not exist.', 400);
    }
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('customer');

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  return ApiResponse.success(res, 'Order updated successfully.', order);
});

/**
 * Delete Order by MongoDB ObjectId with CASCADE constraints
 */
export const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  // CASCADE: Delete all OrderItems associated with this Order
  await OrderItem.deleteMany({ order: order._id });

  // Delete the Order
  await Order.findByIdAndDelete(order._id);

  return ApiResponse.delete(res, 'Order deleted successfully.');
});
