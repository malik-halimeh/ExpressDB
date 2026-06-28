import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';
import {
  customerCreateValidator,
  customerUpdateValidator
} from '../validators/customerValidator.js';
import validate from '../validators/validate.js';

const router = express.Router();

router.route('/')
  .post(customerCreateValidator, validate, createCustomer)
  .get(getAllCustomers);

router.route('/:id')
  .get(getCustomerById)
  .put(customerUpdateValidator, validate, updateCustomer)
  .delete(deleteCustomer);

export default router;
