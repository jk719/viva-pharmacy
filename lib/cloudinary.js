export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dv3cd1aoy';

// Add this debug log with environment indication
console.log('Cloudinary Configuration:', {
  CLOUD_NAME: CLOUDINARY_CLOUD_NAME,
  ENV_VALUE: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  ENV: process.env.NODE_ENV
});

export const FALLBACK_IMAGE = '/images/placeholder.png';

// Add debug function to log image URLs
export function debugImageUrl(product) {
  const url = getCloudinaryUrl(product);
  console.log('Image URL Debug:', {
    productId: product?._id,
    name: product?.name,
    imageUrl: product?.imageUrl,
    cloudinaryId: product?.cloudinaryPublicId,
    generatedUrl: url,
  });
  return url;
}

// Known Cloudinary folder paths with fallbacks
export const CLOUDINARY_FOLDERS = {
  PRODUCTS: 'viva-pharmacy-online-store'
};

/**
 * Normalizes a product name for use in URLs
 */
export function normalizeProductName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .trim();
}

/**
 * Enhanced Cloudinary URL generator with standardized folder structure
 */
export function getCloudinaryUrl(product) {
  try {
    // If no product, return fallback
    if (!product) return FALLBACK_IMAGE;

    // If we have a full Cloudinary URL, use it directly
    if (typeof product === 'string' && product.includes('cloudinary.com')) {
      // Convert old paths to new format if needed
      if (product.includes('/viva-pharmacy/products/')) {
        const oldPath = '/viva-pharmacy/products/';
        const newPath = `/${CLOUDINARY_FOLDERS.PRODUCTS}/`;
        return product.replace(oldPath, newPath);
      }
      return product;
    }

    // If product has imageUrl, use it directly - this is the most reliable source
    if (product.imageUrl && product.imageUrl.includes('cloudinary.com')) {
      // Convert old paths to new format if needed
      if (product.imageUrl.includes('/viva-pharmacy/products/')) {
        const oldPath = '/viva-pharmacy/products/';
        const newPath = `/${CLOUDINARY_FOLDERS.PRODUCTS}/`;
        return product.imageUrl.replace(oldPath, newPath);
      }
      return product.imageUrl;
    }

    // If we have a cloudinaryPublicId, use it to construct the URL
    if (product.cloudinaryPublicId) {
      // Check if it already includes the correct folder structure
      if (product.cloudinaryPublicId.includes(CLOUDINARY_FOLDERS.PRODUCTS)) {
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${product.cloudinaryPublicId}`;
      }
      
      // Convert old path structure to new one if needed
      if (product.cloudinaryPublicId.includes('viva-pharmacy/products/')) {
        const fileName = product.cloudinaryPublicId.split('viva-pharmacy/products/')[1];
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_FOLDERS.PRODUCTS}/${fileName}`;
      }
      
      // Otherwise use as is
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${product.cloudinaryPublicId}`;
    }

    // If we have the image field and it's a full URL, use it
    if (product.image && product.image.includes('cloudinary.com')) {
      // Convert old paths to new format if needed
      if (product.image.includes('/viva-pharmacy/products/')) {
        const oldPath = '/viva-pharmacy/products/';
        const newPath = `/${CLOUDINARY_FOLDERS.PRODUCTS}/`;
        return product.image.replace(oldPath, newPath);
      }
      return product.image;
    }

    // Last resort: Generate URL from product slug
    if (product.slug) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_FOLDERS.PRODUCTS}/${product.slug}.jpg`;
    }

    // Ultimate fallback
    return FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error in getCloudinaryUrl:', error);
    return FALLBACK_IMAGE;
  }
}

/**
 * Gets possible image URLs for a product name
 */
export function getPossibleImageUrls(productName) {
  if (!productName) return [FALLBACK_IMAGE];
  
  // If it's already a full URL, return it with a fallback
  if (typeof productName === 'string' && productName.includes('cloudinary.com')) {
    // Convert old URLs to new format if needed
    if (productName.includes('/viva-pharmacy/products/')) {
      const oldPath = '/viva-pharmacy/products/';
      const newPath = `/${CLOUDINARY_FOLDERS.PRODUCTS}/`;
      return [
        productName.replace(oldPath, newPath),
        productName,
        FALLBACK_IMAGE
      ];
    }
    return [productName, FALLBACK_IMAGE];
  }
  
  const normalized = normalizeProductName(productName);
  
  // Only include standardized folder paths
  return [
    // Standard format with both extensions
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_FOLDERS.PRODUCTS}/${normalized}.jpg`,
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_FOLDERS.PRODUCTS}/${normalized}.png`,
    
    // Root path as fallback
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${normalized}.jpg`,
    
    // Fallback image
    FALLBACK_IMAGE
  ];
}

/**
 * Upload file to Cloudinary with consistent folder structure
 */
export async function uploadToCloudinary(file, productName = null) {
  try {
    if (!file) {
      console.warn('No file provided to uploadToCloudinary');
      return { url: FALLBACK_IMAGE, publicId: null };
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'viva_pharmacy_products');
    
    // Normalize the product name for the filename if provided
    let filename = 'product-' + Date.now().toString().slice(-6);
    if (productName) {
      filename = normalizeProductName(productName) + '-' + Date.now().toString().slice(-4);
    }
    
    // Use the current folder structure for consistency
    const publicId = `${CLOUDINARY_FOLDERS.PRODUCTS}/${filename}`;
    formData.append('public_id', publicId);
    
    console.log('Uploading to Cloudinary with public_id:', publicId);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary upload error:', data);
      throw new Error(data.message || 'Failed to upload image');
    }

    console.log('Cloudinary upload success:', {
      url: data.secure_url,
      publicId: data.public_id
    });

    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
} 