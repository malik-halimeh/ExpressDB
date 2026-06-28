import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    required: [true, 'order_id is required'],
    unique: true,
    validate: {
      validator: Number.isInteger,
      message: 'order_id must be an integer'
    }
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'customer reference is required']
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  total_amount: {
    type: Number,
    required: [true, 'total_amount is required'],
    min: [0, 'total_amount must be greater than or equal to zero'],
    default: 0
  }
}, {
  timestamps: true,
  collection: 'orders'
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
