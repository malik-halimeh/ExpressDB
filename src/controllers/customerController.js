import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { getPagination, getPageCount } from '../utils/pagination.js';

/**
 * Create a new Customer
 */
export const createCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.create(req.body);
  return ApiResponse.success(res, 'Customer created successfully.', customer, 201);
});

/**
 * Retrieve all Customers with pagination
 */
export const getAllCustomers = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const totalDocuments = await Customer.countDocuments();
  const data = await Customer.find()
    .sort({ customer_id: 1 })
    .skip(skip)
    .limit(limit);

  const totalPages = getPageCount(totalDocuments, limit);

  return ApiResponse.collection(
    res,
    'Customers retrieved successfully.',
    page,
    limit,
    totalDocuments,
    totalPages,
    data
  );
});

/**
 * Retrieve Customer by MongoDB ObjectId
 */
export const getCustomerById = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  return ApiResponse.success(res, 'Customer retrieved successfully.', customer);
});

/**
 * Update Customer by MongoDB ObjectId
 */
export const updateCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  return ApiResponse.success(res, 'Customer updated successfully.', customer);
});

/**
 * Delete Customer by MongoDB ObjectId with RESTRICT constraints
 */
export const deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw new AppError('Customer not found.', 404);
  }

  // RESTRICT: Block delete if any Order references this Customer ObjectId
  const activeOrdersCount = await Order.countDocuments({ customer: customer._id });
  if (activeOrdersCount > 0) {
    throw new AppError(
      `Cannot delete customer: Customer is referenced by ${activeOrdersCount} active orders (RESTRICT constraint).`,
      400
    );
  }

  await Customer.findByIdAndDelete(customer._id);

  return ApiResponse.delete(res, 'Customer deleted successfully.');
});
