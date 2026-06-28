import express from 'express';
import categoryRoutes from './categoryRoutes.js';
import customerRoutes from './customerRoutes.js';
import menuItemRoutes from './menuItemRoutes.js';
import orderRoutes from './orderRoutes.js';
import orderItemRoutes from './orderItemRoutes.js';

const router = express.Router();

router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/orders', orderRoutes);
router.use('/order-items', orderItemRoutes);

export default router;
