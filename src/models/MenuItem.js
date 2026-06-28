import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  item_id: {
    type: Number,
    required: [true, 'item_id is required'],
    unique: true,
    validate: {
      validator: Number.isInteger,
      message: 'item_id must be an integer'
    }
  },
  item_name: {
    type: String,
    required: [true, 'item_name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'price is required'],
    min: [0, 'price must be greater than or equal to zero']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'category is required']
  },
  description: {
    type: String,
    trim: true
  },
  image_url: {
    type: String,
    trim: true
  },
  is_available: {
    type: Boolean,
    required: [true, 'is_available is required'],
    default: true
  }
}, {
  timestamps: true,
  collection: 'menuitems'
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
