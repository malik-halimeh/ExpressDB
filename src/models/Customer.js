import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customer_id: {
    type: Number,
    required: [true, 'customer_id is required'],
    unique: true,
    validate: {
      validator: Number.isInteger,
      message: 'customer_id must be an integer'
    }
  },
  customer_name: {
    type: String,
    required: [true, 'customer_name is required'],
    trim: true
  },
  phone_number: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'customers'
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
