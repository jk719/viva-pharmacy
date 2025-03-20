export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dv3cd1aoy';

// Add this debug log
console.log('Cloudinary Configuration:', {
  CLOUD_NAME: CLOUDINARY_CLOUD_NAME,
  ENV_VALUE: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
});

export const FALLBACK_IMAGE = '/images/placeholder.png';

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
 * Enhanced Cloudinary URL generator with multiple fallback strategies
 */
export function getCloudinaryUrl(product) {
  try {
    // If no product, return fallback
    if (!product) return FALLBACK_IMAGE;

    // Handle case where product is actually a public ID string
    if (typeof product === 'string') {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${product}`;
    }

    // If we have a full Cloudinary URL, use it
    if (product.imageUrl?.includes('res.cloudinary.com')) {
      return product.imageUrl;
    }

    // If we have a cloudinaryPublicId, construct the URL
    if (product.cloudinaryPublicId) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${product.cloudinaryPublicId}`;
    }

    // Check for legacy image URL
    if (product.image?.includes('res.cloudinary.com')) {
      return product.image;
    }

    // If we have a product name, try to generate a URL
    if (product.name) {
      const normalized = normalizeProductName(product.name);
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/viva-pharmacy/products/${normalized}.png`;
    }

    // Fallback to default image
    return FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error in getCloudinaryUrl:', error);
    return FALLBACK_IMAGE;
  }
}

/**
 * Tries multiple URL formats to find a working image URL
 * @returns {Array} - Array of possible URLs to try
 */
export function getPossibleImageUrls(productName) {
  if (!productName) return [FALLBACK_IMAGE];
  
  const normalized = normalizeProductName(productName);
  return [
    // Format 1: Direct cloudinary path with product name
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${normalized}.png`,
    
    // Format 2: With viva-pharmacy/products folder
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/viva-pharmacy/products/${normalized}.png`,
    
    // Format 3: With _bbq4sy suffix - from your existing OrderHistory component
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${normalized}_bbq4sy.png`,
    
    // Fallback
    FALLBACK_IMAGE
  ];
}

export async function uploadToCloudinary(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }

    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
} 