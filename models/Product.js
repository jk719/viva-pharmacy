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
    maxLength: [200, 'Short description cannot exceed 200 characters'],
    default: function() {
      return this.description?.substring(0, 150) + (this.description?.length > 150 ? '...' : '');
    }
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
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  cloudinaryPublicId: {
    type: String,
    required: false,
    trim: true
  },
  imageKey: {
    type: String,
    required: false
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
      required: [true, 'Meta title is required'],
      default: function() {
        return `${this.name} | ${this.category || 'Medicine'} | GoVivanova Pharmacy`;
      }
    },
    metaDescription: {
      type: String,
      required: [true, 'Meta description is required'],
      default: function() {
        return this.shortDescription || this.description?.substring(0, 150);
      }
    },
    metaKeywords: [String],
    structuredData: mongoose.Schema.Types.Mixed,
    canonical: {
      type: String,
      required: [true, 'Canonical URL is required'],
      default: function() {
        const categorySlug = this.categorySlug || 'medicine';
        const itemSlug = this.itemSlug || 'general';
        return `/${categorySlug}/${itemSlug}/${this.slug}`;
      }
    },
    breadcrumbs: [{
      name: String,
      url: String
    }]
  },

  // Add this to the productSchema
  categoryTagline: {
    type: String,
    required: false
  },

  // Add this to your schema
  editHistory: [{
    editedBy: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }]
  }],
}, {
  timestamps: true
});

// Add indexes
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ 'seo.canonical': 1 }, { unique: true });
productSchema.index({ keywords: 1 });
productSchema.index({ name: 'text', shortDescription: 'text', keywords: 'text' });

// Generate SKU method
productSchema.statics.generateSKU = async function(categorySlug) {
  const prefix = categorySlug.substring(0, 3).toUpperCase();
  
  // Create a counter collection if it doesn't exist
  const counterCollection = mongoose.connection.collection('counters');
  const counterDoc = await counterCollection.findOneAndUpdate(
    { _id: 'productSKU' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  
  const counter = counterDoc.value ? counterDoc.value.seq : 1;
  return `${prefix}${counter.toString().padStart(6, '0')}`;
};

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