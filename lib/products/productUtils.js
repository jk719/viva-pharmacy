import { categories } from '@/data/categories';

// Remove mongoose and Product imports - client-side only utilities
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

export const validateProduct = (product) => {
  const requiredFields = ['name', 'description', 'price', 'category', 'image'];
  const missingFields = requiredFields.filter(field => !product[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
    throw new Error('Price must be a positive number');
  }

  return true;
};

export const getImageUrl = (product) => {
  if (!product) return '/images/placeholder.png';
  
  // If we have a direct imageUrl, use it
  if (product.imageUrl) {
    return product.imageUrl;
  }
  
  // If we have a cloudinaryPublicId, construct the URL
  if (product.cloudinaryPublicId) {
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${product.cloudinaryPublicId}`;
  }
  
  // Legacy fallback
  if (product.imageKey) {
    return `/images/products/${product.imageKey}`;
  }
  
  // Ultimate fallback
  return '/images/placeholder.png';
};

export const sanitizeProduct = (product) => {
  if (!product) return null;
  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category,
    subcategory: product.subcategory,
    imageUrl: getImageUrl(product),
    isFeatured: Boolean(product.isFeatured),
    ingredients: product.ingredients || '',
    directions: product.directions || '',
    warnings: product.warnings || '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
};

export const getAllSubcategories = () => {
  const subcategories = new Set();
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategories.add(subcategory.name);
    });
  });
  return Array.from(subcategories);
};

export const validateSubcategory = (subcategory) => {
  const allSubcategories = getAllSubcategories();
  return allSubcategories.includes(subcategory) ? subcategory : null;
};

export const groupProductsBySubcategory = (products) => {
  if (!Array.isArray(products)) {
    console.warn('Products is not an array:', products);
    return {};
  }

  const validSubcategories = getAllSubcategories();
  const groups = {};

  products.forEach(product => {
    if (product?.subcategory && validSubcategories.includes(product.subcategory)) {
      if (!groups[product.subcategory]) {
        groups[product.subcategory] = [];
      }
      groups[product.subcategory].push(sanitizeProduct(product));
    }
  });

  return Object.fromEntries(
    Object.entries(groups)
      .filter(([_, products]) => products.length > 0)
      .sort(([,a], [,b]) => b.length - a.length)
  );
};

export const getParentCategory = (subcategoryName) => {
  for (const category of categories) {
    const found = category.subcategories.find(sub => sub.name === subcategoryName);
    if (found) return category.name;
  }
  return null;
};

export const getSubcategoryItems = (subcategoryName) => {
  for (const category of categories) {
    const subcategory = category.subcategories.find(sub => sub.name === subcategoryName);
    if (subcategory) return subcategory.items;
  }
  return [];
};