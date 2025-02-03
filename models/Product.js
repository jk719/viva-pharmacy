// Add server-side check at the top
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

import mongoose from 'mongoose';
import { categories } from '../data/categories.js';

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
    trim: true,
    validate: {
      validator: function(v) {
        return categories.some(cat => cat.name === v);
      },
      message: props => `${props.value} is not a valid category`
    }
  },
  categoryTagline: {
    type: String,
    required: false,
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
    index: true,
    validate: {
      validator: function(v) {
        return categories.some(cat => cat.slug === v);
      },
      message: props => `${props.value} is not a valid category slug`
    }
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
  itemSlug: 1 
});

// Virtual fields
productSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});

// Static methods
productSchema.statics.generateSKU = async function(categorySlug) {
  const category = categories.find(c => c.slug === categorySlug);
  const prefix = category?.name.substring(0, 3).toUpperCase() || 'PRD';
  const count = await this.countDocuments({ categorySlug });
  return `${prefix}${(count + 1).toString().padStart(4, '0')}`;
};

// Instance methods
productSchema.methods.getCategoryName = function() {
  const category = categories.find(c => c.slug === this.categorySlug);
  const item = category?.items.find(i => i.slug === this.itemSlug);
  
  return {
    category: category?.name || '',
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
  if (this.isModified('categorySlug') || this.isModified('itemSlug')) {
    const category = categories.find(c => c.slug === this.categorySlug);
    if (!category) {
      throw new Error(`Invalid category: ${this.categorySlug}`);
    }

    const item = category.items.find(i => i.slug === this.itemSlug);
    if (!item) {
      throw new Error(`Invalid item: ${this.itemSlug}`);
    }

    // Set the names
    this.category = category.name;
    this.item = item.name;
    this.categoryPath = `${category.name} > ${item.name}`;
  }
  if (this.isModified('categorySlug')) {
    const category = categories.find(c => c.slug === this.categorySlug);
    if (category) {
      this.categoryTagline = category.tagline;
    }
  }
  next();
});

// Add comprehensive error handling middleware
productSchema.post('save', function(error, doc, next) {
    if (error.name === 'ValidationError') {
        console.error('Validation Error:', error);
        next(new Error('Invalid product data: ' + Object.values(error.errors).map(e => e.message).join(', ')));
    } else if (error.code === 11000) {
        console.error('Duplicate Key Error:', error);
        next(new Error('A product with this SKU already exists'));
    } else if (error.name === 'CastError') {
        console.error('Cast Error:', error);
        next(new Error('Invalid data type provided for ' + error.path));
    } else if (error.name === 'MongoServerError') {
        console.error('MongoDB Server Error:', error);
        next(new Error('Database error occurred. Please try again later.'));
    } else {
        console.error('Unknown Error:', error);
        next(error);
    }
});

// Add pre-save middleware for data validation
productSchema.pre('save', function(next) {
    try {
        // Ensure required fields are present
        if (!this.name || !this.price || !this.categorySlug) {
            throw new Error('Missing required fields');
        }

        // Validate price is positive
        if (this.price <= 0) {
            throw new Error('Price must be greater than 0');
        }

        // Ensure stock is non-negative
        if (typeof this.stock !== 'undefined' && this.stock < 0) {
            this.stock = 0;
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Create a helper function to check if mongoose is ready
const getModel = () => {
  try {
    return mongoose.models.Product || mongoose.model('Product', productSchema);
  } catch (error) {
    if (error.name === 'MissingSchemaError') {
      // Schema hasn't been registered yet
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
            return this.isNew;
          },
          immutable: true
        }
      }, {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        suppressReservedKeysWarning: true
      });

      // Add your indexes
      productSchema.index({ 
        name: 'text', 
        description: 'text',
        'activeIngredients.name': 'text'
      });

      productSchema.index({ 
        categorySlug: 1, 
        itemSlug: 1 
      });

      // Add your virtuals
      productSchema.virtual('isInStock').get(function() {
        return this.stock > 0;
      });

      // Add your statics
      productSchema.statics.generateSKU = async function(categorySlug) {
        const category = categories.find(c => c.slug === categorySlug);
        const prefix = category?.name.substring(0, 3).toUpperCase() || 'PRD';
        const count = await this.countDocuments({ categorySlug });
        return `${prefix}${(count + 1).toString().padStart(4, '0')}`;
      };

      // Add your middleware
      productSchema.pre('save', function(next) {
        if (this.isNew) {
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

      productSchema.pre('validate', async function(next) {
        if (this.isModified('categorySlug') || this.isModified('itemSlug')) {
          const category = categories.find(c => c.slug === this.categorySlug);
          if (!category) {
            throw new Error(`Invalid category: ${this.categorySlug}`);
          }

          const item = category.items.find(i => i.slug === this.itemSlug);
          if (!item) {
            throw new Error(`Invalid item: ${this.itemSlug}`);
          }

          this.category = category.name;
          this.item = item.name;
          this.categoryPath = `${category.name} > ${item.name}`;
        }
        if (this.isModified('categorySlug')) {
          const category = categories.find(c => c.slug === this.categorySlug);
          if (category) {
            this.categoryTagline = category.tagline;
          }
        }
        next();
      });

      return mongoose.model('Product', productSchema);
    }
    throw error;
  }
};

// Export a function that returns the model
export default function getProductModel() {
  if (typeof window !== 'undefined') {
    throw new Error('getProductModel can only be used on the server side');
  }
  return getModel();
}
 