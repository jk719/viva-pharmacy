import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(v) {
        // Allow Cloudinary URLs or set to null/empty for fallback
        return !v || v.startsWith('https://res.cloudinary.com/');
      },
      message: props => `${props.value} is not a valid Cloudinary URL`
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        "Pain Relief",
        "Cold & Flu Relief",
        "Digestive Health",
        "First Aid",
        "Feminine Care",
        "Vitamins",
        "Allergy Relief",
        "Sleep Aid",
        "Foot Care"
      ],
      message: '{VALUE} is not a valid category'
    }
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Liquid', 'Cream', 'Gel', 'Spray', 'Other'],
    required: [true, 'Dosage form is required']
  },
  activeIngredients: [{
    name: String,
    amount: String
  }],
  warnings: [String],
  directions: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text' });

// Add method to generate SKU
productSchema.statics.generateSKU = async function(category) {
  const prefix = category.substring(0, 3).toUpperCase();
  const count = await this.countDocuments({ category });
  const number = (count + 1).toString().padStart(4, '0');
  return `${prefix}${number}`;
};

export default mongoose.models.Product || mongoose.model('Product', productSchema);
