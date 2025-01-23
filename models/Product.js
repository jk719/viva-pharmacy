import mongoose from 'mongoose';
import { categories, isCategoryValid, isSubcategoryValid, isItemValid } from '@/data/categories';

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
    required: [true, 'Category name is required'],
    trim: true
  },
  subcategory: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true
  },
  item: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  categoryPath: {
    type: String,
    required: [true, 'Category path is required'],
    trim: true
  },
  categorySlug: {
    type: String,
    required: [true, 'Category slug is required'],
    index: true
  },
  subcategorySlug: {
    type: String,
    required: [true, 'Subcategory slug is required'],
    index: true
  },
  itemSlug: {
    type: String,
    required: [true, 'Item slug is required'],
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isPopular: {
    type: Boolean,
    default: false,
    index: true
  },
  isNewProduct: {
    type: Boolean,
    default: true,
    index: true
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
    enum: ['Tablet', 'Capsule', 'Liquid', 'Cream', 'Gel', 'Spray', 'Drops', 'Gummies', 'Powder', 'Patch', 'Other'],
    required: [true, 'Dosage form is required']
  },
  activeIngredients: [{
    name: {
      type: String,
      required: [true, 'Ingredient name is required']
    },
    amount: {
      type: String,
      required: [true, 'Ingredient amount is required']
    }
  }],
  warnings: [String],
  directions: String,
  contraindications: [String],
  sideEffects: [String],
  storage: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.isNew; // Only required for new documents
    },
    immutable: true // This ensures createdBy can't be modified after creation
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  suppressReservedKeysWarning: true
});

// Improved indexes for search and filtering
productSchema.index({ 
  name: 'text', 
  description: 'text',
  'activeIngredients.name': 'text'
});

productSchema.index({ 
  categorySlug: 1, 
  subcategorySlug: 1, 
  itemSlug: 1 
});

// Virtual fields
productSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});

// Static methods
productSchema.statics.generateSKU = async function(categorySlug, subcategorySlug) {
  const category = categories.find(c => c.slug === categorySlug);
  const subcategory = category?.subcategories.find(s => s.slug === subcategorySlug);
  
  const prefix = `${category?.name.substring(0, 2)}${subcategory?.name.substring(0, 2)}`.toUpperCase();
  const count = await this.countDocuments({ 
    categorySlug,
    subcategorySlug 
  });
  
  return `${prefix}${(count + 1).toString().padStart(4, '0')}`;
};

// Instance methods
productSchema.methods.getCategoryName = function() {
  const category = categories.find(c => c.slug === this.categorySlug);
  const subcategory = category?.subcategories.find(s => s.slug === this.subcategorySlug);
  const item = subcategory?.items.find(i => i.slug === this.itemSlug);
  
  return {
    category: category?.name || '',
    subcategory: subcategory?.name || '',
    item: item?.name || ''
  };
};

productSchema.methods.updateStock = async function(quantity) {
  this.stock += quantity;
  if (this.stock < 0) this.stock = 0;
  return this.save();
};

// Middleware
productSchema.pre('save', function(next) {
  if (this.$isNew) {
    this.isNewProduct = true;
    const productId = this._id;
    setTimeout(async () => {
      try {
        await mongoose.model('Product').findByIdAndUpdate(
          productId,
          { $set: { isNewProduct: false } }
        );
      } catch (error) {
        console.error('Failed to update isNewProduct status:', error);
      }
    }, 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Update the pre-validate middleware
productSchema.pre('validate', async function(next) {
  if (this.isModified('categorySlug') || this.isModified('subcategorySlug') || this.isModified('itemSlug')) {
    const category = categories.find(c => c.slug === this.categorySlug);
    if (!category) {
      throw new Error(`Invalid category: ${this.categorySlug}`);
    }

    const subcategory = category.subcategories.find(s => s.slug === this.subcategorySlug);
    if (!subcategory) {
      throw new Error(`Invalid subcategory: ${this.subcategorySlug}`);
    }

    const item = subcategory.items.find(i => i.slug === this.itemSlug);
    if (!item) {
      throw new Error(`Invalid item: ${this.itemSlug}`);
    }

    // Set the category names
    this.category = category.name;
    this.subcategory = subcategory.name;
    this.item = item.name;
    this.categoryPath = `${category.name} > ${subcategory.name} > ${item.name}`;
  }
  next();
});

// Add post-save middleware to handle validation errors
productSchema.post('save', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    console.error('Validation Error:', error);
    next(new Error('Invalid product data: ' + Object.values(error.errors).map(e => e.message).join(', ')));
  } else {
    next(error);
  }
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
 