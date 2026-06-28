import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { getPagination, getPageCount } from '../utils/pagination.js';

/**
 * Create a new Category
 */
export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  return ApiResponse.success(res, 'Category created successfully.', category, 201);
});

/**
 * Retrieve all Categories with offset pagination
 */
export const getAllCategories = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const totalDocuments = await Category.countDocuments();
  const data = await Category.find()
    .sort({ category_id: 1 })
    .skip(skip)
    .limit(limit);

  const totalPages = getPageCount(totalDocuments, limit);

  return ApiResponse.collection(
    res,
    'Categories retrieved successfully.',
    page,
    limit,
    totalDocuments,
    totalPages,
    data
  );
});

/**
 * Retrieve Category by MongoDB ObjectId
 */
export const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  return ApiResponse.success(res, 'Category retrieved successfully.', category);
});

/**
 * Update Category by MongoDB ObjectId
 */
export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  return ApiResponse.success(res, 'Category updated successfully.', category);
});

/**
 * Delete Category by MongoDB ObjectId with RESTRICT constraints
 */
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found.', 404);
  }

  // RESTRICT: Block delete if any MenuItem references this Category ObjectId
  const activeMenuItemsCount = await MenuItem.countDocuments({ category: category._id });
  if (activeMenuItemsCount > 0) {
    throw new AppError(
      `Cannot delete category: Category is referenced by ${activeMenuItemsCount} active menu items (RESTRICT constraint).`,
      400
    );
  }

  await Category.findByIdAndDelete(category._id);

  return ApiResponse.delete(res, 'Category deleted successfully.');
});
