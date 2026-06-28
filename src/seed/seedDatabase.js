import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from '../config/database.js';
import Category from '../models/Category.js';
import Customer from '../models/Customer.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const readJsonFile = (fileName) => {
  const filePath = path.join(__dirname, 'seedData', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const seedDatabase = async () => {
  try {
    console.log('Connecting...');
    await connectDB();

    console.log('Clearing collections...');
    await Category.deleteMany();
    await Customer.deleteMany();
    await MenuItem.deleteMany();
    await Order.deleteMany();
    await OrderItem.deleteMany();

    console.log('Importing categories...');
    const rawCategories = readJsonFile('categories.json');
    const categories = await Category.insertMany(rawCategories);
    
    // category_id -> ObjectId mapping
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.category_id] = cat._id;
    });

    console.log('Importing customers...');
    const rawCustomers = readJsonFile('customers.json');
    const customers = await Customer.insertMany(rawCustomers);

    // customer_id -> ObjectId mapping
    const customerMap = {};
    customers.forEach((cust) => {
      customerMap[cust.customer_id] = cust._id;
    });

    console.log('Importing menu items...');
    const rawMenuItems = readJsonFile('menuitems.json');
    const menuItemsToInsert = rawMenuItems.map((item) => ({
      item_id: item.item_id,
      item_name: item.item_name,
      price: item.price,
      category: categoryMap[item.category_id],
      description: item.description,
      image_url: item.image_url,
      is_available: item.is_available
    }));
    const menuItems = await MenuItem.insertMany(menuItemsToInsert);

    // item_id -> ObjectId mapping
    const menuItemMap = {};
    menuItems.forEach((item) => {
      menuItemMap[item.item_id] = item._id;
    });

    console.log('Importing orders...');
    const rawOrders = readJsonFile('orders.json');
    const ordersToInsert = rawOrders.map((order) => ({
      order_id: order.order_id,
      customer: customerMap[order.customer_id],
      order_date: new Date(order.order_date),
      total_amount: order.total_amount
    }));
    const orders = await Order.insertMany(ordersToInsert);

    // order_id -> ObjectId mapping
    const orderMap = {};
    orders.forEach((order) => {
      orderMap[order.order_id] = order._id;
    });

    console.log('Importing order items...');
    const rawOrderItems = readJsonFile('orderitems.json');
    const orderItemsToInsert = rawOrderItems.map((item) => ({
      order_item_id: item.order_item_id,
      order: orderMap[item.order_id],
      menuItem: menuItemMap[item.item_id],
      quantity: item.quantity,
      unit_price: item.unit_price
    }));
    const orderItems = await OrderItem.insertMany(orderItemsToInsert);

    // Verification
    const countCategories = await Category.countDocuments();
    const countCustomers = await Customer.countDocuments();
    const countMenuItems = await MenuItem.countDocuments();
    const countOrders = await Order.countDocuments();
    const countOrderItems = await OrderItem.countDocuments();

    // Check for orphan references
    const invalidMenuItems = await MenuItem.countDocuments({ category: { $exists: false } });
    const invalidOrders = await Order.countDocuments({ customer: { $exists: false } });
    const invalidOrderItems = await OrderItem.countDocuments({
      $or: [
        { order: { $exists: false } },
        { menuItem: { $exists: false } }
      ]
    });

    if (invalidMenuItems > 0 || invalidOrders > 0 || invalidOrderItems > 0) {
      throw new Error('Relationship verification failed: Orphans detected.');
    }

    console.log('Database seeded successfully.');
    console.log(`Categories: ${countCategories}`);
    console.log(`Customers: ${countCustomers}`);
    console.log(`Menu Items: ${countMenuItems}`);
    console.log(`Orders: ${countOrders}`);
    console.log(`Order Items: ${countOrderItems}`);
    console.log('All relationships verified.');

  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  } finally {
    console.log('Disconnected.');
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();
