export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dv3cd1aoy';

// Add this debug log with environment indication
console.log('Cloudinary Configuration:', {
  CLOUD_NAME: CLOUDINARY_CLOUD_NAME,
  ENV_VALUE: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  ENV: process.env.NODE_ENV
});

export const FALLBACK_IMAGE = '/images/placeholder.png';

// Known Cloudinary folder path
export const CLOUDINARY_FOLDER = 'viva-pharmacy-online-store';

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
      return product;
    }

    // If product has imageUrl, use it directly - this is the most reliable source
    if (product.imageUrl && product.imageUrl.includes('cloudinary.com')) {
      return product.imageUrl;
    }

    // If we have a cloudinaryPublicId, use it to construct the URL
    if (product.cloudinaryPublicId) {
      const transformations = [
        'f_auto',           // Auto format
        'q_auto',           // Auto quality
        'c_scale',          // Scale to fit
        'w_800',            // Width 800px
        'h_800',            // Height 800px
        'c_fill',           // Fill mode
        'g_auto',           // Auto gravity
        'fl_progressive'    // Progressive loading
      ].join(',');
      
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${product.cloudinaryPublicId}`;
    }

    // If we have the image field and it's a full URL, use it
    if (product.image && product.image.includes('cloudinary.com')) {
      return product.image;
    }

    // If we have a local image path, use it
    if (product.image && product.image.startsWith('/')) {
      return product.image;
    }

    // Try to construct URL from product name
    if (product.name) {
      const normalizedName = normalizeProductName(product.name);
      const categoryFolder = product.category ? 
        `${CLOUDINARY_FOLDER}/${normalizeProductName(product.category)}` : 
        CLOUDINARY_FOLDER;
      
      const transformations = [
        'f_auto',           // Auto format
        'q_auto',           // Auto quality
        'c_scale',          // Scale to fit
        'w_800',            // Width 800px
        'h_800',            // Height 800px
        'c_fill',           // Fill mode
        'g_auto',           // Auto gravity
        'fl_progressive'    // Progressive loading
      ].join(',');
      
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${categoryFolder}/${normalizedName}`;
    }

    // Ultimate fallback
    return FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error in getCloudinaryUrl:', error);
    return FALLBACK_IMAGE;
  }
}

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

/**
 * Gets possible image URLs for a product name
 */
export function getPossibleImageUrls(productName) {
  if (!productName) return [FALLBACK_IMAGE];
  
  // If it's already a full URL, return it with a fallback
  if (typeof productName === 'string' && productName.includes('cloudinary.com')) {
    return [productName, FALLBACK_IMAGE];
  }
  
  // Try the folder path
  const normalizedName = normalizeProductName(productName);
  return [
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${CLOUDINARY_FOLDER}/${normalizedName}`,
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
    const publicId = `${CLOUDINARY_FOLDER}/${filename}`;
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