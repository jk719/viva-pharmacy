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

    // If we have a full Cloudinary URL, use it directly
    if (typeof product === 'string' && product.includes('cloudinary.com')) {
      return product;
    }

    // If product has imageUrl, use it directly - this is the most reliable source
    if (product.imageUrl && product.imageUrl.includes('cloudinary.com')) {
      return product.imageUrl;
    }

    // If we have a cloudinaryPublicId, use it to construct the URL
    if (product.cloudinaryPublicId) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${product.cloudinaryPublicId}`;
    }

    // If we have the image field and it's a full URL, use it
    if (product.image && product.image.includes('cloudinary.com')) {
      return product.image;
    }

    // Last resort: Generate URL from product name/slug
    // But only do this for products created after we started using reliable image handling
    if (product.slug) {
      const timestamp = product.slug.match(/-(\d{4})$/)?.[1];
      if (timestamp) {
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/viva-pharmacy/products/${product.slug}.png`;
      }
    }

    // Ultimate fallback
    return FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error in getCloudinaryUrl:', error);
    return FALLBACK_IMAGE;
  }
}

/**
 * Tries multiple URL formats to find a working image URL
 */
export function getPossibleImageUrls(productName) {
  if (!productName) return [FALLBACK_IMAGE];
  
  const normalized = normalizeProductName(productName);
  return [
    // Try all common patterns without forcing v1
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/viva-pharmacy/products/${normalized}.png`,
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${normalized}.png`,
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${normalized}_bbq4sy.png`,
    // Add version-specific paths if needed
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1735065580/viva-pharmacy/products/${normalized}.png`,
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1737392382/viva-pharmacy/products/${normalized}.png`,
    // Fallback
    FALLBACK_IMAGE
  ];
}

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
    
    // Use a consistent public_id format
    const publicId = `viva-pharmacy/products/${filename}`;
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