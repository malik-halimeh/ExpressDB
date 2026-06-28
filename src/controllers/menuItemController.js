import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import OrderItem from '../models/OrderItem.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { getPagination, getPageCount } from '../utils/pagination.js';

/**
 * Create a new MenuItem
 */
export const createMenuItem = asyncHandler(async (req, res, next) => {
  const { category } = req.body;

  // Custom validation: Verify referenced Category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError('Referenced Category does not exist.', 400);
  }

  const menuItem = await MenuItem.create(req.body);
  return ApiResponse.success(res, 'Menu item created successfully.', menuItem, 201);
});

/**
 * Retrieve all MenuItems with pagination
 */
export const getAllMenuItems = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const totalDocuments = await MenuItem.countDocuments();
  const data = await MenuItem.find()
    .sort({ item_id: 1 })
    .skip(skip)
    .limit(limit)
    .populate('category');

  const totalPages = getPageCount(totalDocuments, limit);

  return ApiResponse.collection(
    res,
    'Menu items retrieved successfully.',
    page,
    limit,
    totalDocuments,
    totalPages,
    data
  );
});

/**
 * Retrieve MenuItem by MongoDB ObjectId
 */
export const getMenuItemById = asyncHandler(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.id).populate('category');
  if (!menuItem) {
    throw new AppError('Menu item not found.', 404);
  }

  return ApiResponse.success(res, 'Menu item retrieved successfully.', menuItem);
});

/**
 * Update MenuItem by MongoDB ObjectId
 */
export const updateMenuItem = asyncHandler(async (req, res, next) => {
  const { category } = req.body;

  // Custom validation: Verify referenced Category exists if it is being updated
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new AppError('Referenced Category does not exist.', 400);
    }
  }

  const menuItem = await MenuItem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('category');

  if (!menuItem) {
    throw new AppError('Menu item not found.', 404);
  }

  return ApiResponse.success(res, 'Menu item updated successfully.', menuItem);
});

/**
 * Delete MenuItem by MongoDB ObjectId with RESTRICT constraints
 */
export const deleteMenuItem = asyncHandler(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.id);
  if (!menuItem) {
    throw new AppError('Menu item not found.', 404);
  }

  // RESTRICT: Block delete if any OrderItem references this MenuItem ObjectId
  const activeOrderItemsCount = await OrderItem.countDocuments({ menuItem: menuItem._id });
  if (activeOrderItemsCount > 0) {
    throw new AppError(
      `Cannot delete menu item: Menu item is referenced by ${activeOrderItemsCount} active order items (RESTRICT constraint).`,
      400
    );
  }

  await MenuItem.findByIdAndDelete(menuItem._id);

  return ApiResponse.delete(res, 'Menu item deleted successfully.');
});
