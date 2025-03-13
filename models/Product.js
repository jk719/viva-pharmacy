import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxLength: 200
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
  
  // Image and Category Info
  imageKey: {
    type: String,
    required: false  // Change to false since we're migrating to cloudinaryPublicId
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategoryIndex: {
    type: Number,
    required: [true, 'Subcategory index is required']
  },
  item: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  itemSlug: {
    type: String,
    required: [true, 'Item slug is required'],
    trim: true
  },
  tagline: String,

  // Product Details
  dosageForm: {
    type: String,
    enum: [
      // Oral Forms
      'Tablet',
      'Capsule',
      'Liquid',
      'Syrup',
      'Suspension',
      'Solution',
      'Drops',
      'Gummies',
      'Lozenge',
      'Powder',
      'Caplet',
      
      // Topical Forms
      'Cream',
      'Gel',
      'Ointment',
      'Lotion',
      'Patch',
      'Spray',
      
      // Specialized Forms
      'Suppository',
      'Inhaler',
      'Strip',
      'Wipe',
      'Pad',
      
      // Medical Devices & Others
      'Device',
      'Kit',
      'Bandage',
      'Dressing',
      'Solution',
      'Test Kit',
      'Other'
    ],
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  keywords: [String],
  sku: {
    type: String,
    required: true,
    trim: true
  },

  // Medical Info (all optional)
  activeIngredients: {
    type: [{
      name: {
        type: String,
        required: true
      },
      amount: {
        type: String,
        required: true
      }
    }],
    required: false
  },
  warnings: {
    type: [String],
    required: false
  },
  directions: {
    type: String,
    required: false
  },
  contraindications: {
    type: [String],
    required: false
  },
  sideEffects: {
    type: [String],
    required: false
  },
  storage: {
    type: String,
    required: false
  },

  // SEO Fields
  seo: {
    metaTitle: {
      type: String,
      required: true
    },
    metaDescription: {
      type: String,
      required: true
    },
    metaKeywords: [String],
    structuredData: mongoose.Schema.Types.Mixed,
    canonical: {
      type: String,
      required: true
    },
    breadcrumbs: {
      type: [{
        name: String,
        url: String
      }],
      required: false
    }
  },

  // Add this to the productSchema
  categoryTagline: {
    type: String,
    required: false
  },

  // Add these fields to your productSchema
  imageUrl: {
    type: String,
    required: false
  },
  cloudinaryPublicId: {
    type: String,
    required: false
  },
}, {
  timestamps: true
});

// Add indexes
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ 'seo.canonical': 1 }, { unique: true });
productSchema.index({ keywords: 1 });
productSchema.index({ name: 'text', shortDescription: 'text', keywords: 'text' });

const getModel = () => {
  try {
    return mongoose.models.Product || mongoose.model('Product', productSchema);
  } catch (error) {
    if (error.name === 'MissingSchemaError') {
      return mongoose.model('Product', productSchema);
    }
    throw error;
  }
};

export default getModel; 