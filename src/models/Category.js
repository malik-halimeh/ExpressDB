import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  category_id: {
    type: Number,
    required: [true, 'category_id is required'],
    unique: true,
    validate: {
      validator: Number.isInteger,
      message: 'category_id must be an integer'
    }
  },
  category_name: {
    type: String,
    required: [true, 'category_name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'categories'
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
