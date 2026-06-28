import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order_item_id: {
    type: Number,
    required: [true, 'order_item_id is required'],
    unique: true,
    validate: {
      validator: Number.isInteger,
      message: 'order_item_id must be an integer'
    }
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'order is required']
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: [true, 'menuItem is required']
  },
  quantity: {
    type: Number,
    required: [true, 'quantity is required'],
    min: [1, 'quantity must be greater than zero'],
    validate: {
      validator: Number.isInteger,
      message: 'quantity must be an integer'
    }
  },
  unit_price: {
    type: Number,
    required: [true, 'unit_price is required'],
    min: [0, 'unit_price must be greater than or equal to zero']
  }
}, {
  timestamps: true,
  collection: 'orderitems'
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
export default OrderItem;
