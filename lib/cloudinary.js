export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Add this debug log
console.log('Cloudinary Configuration:', {
  CLOUD_NAME: CLOUDINARY_CLOUD_NAME,
  ENV_VALUE: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
});

export const FALLBACK_IMAGE = '/images/placeholder.png';

export function getCloudinaryUrl(product) {
  try {
    // If no product, return fallback
    if (!product) return FALLBACK_IMAGE;

    // If we have a full Cloudinary URL, use it
    if (product.imageUrl?.includes('res.cloudinary.com')) {
      return product.imageUrl;
    }

    // If we have a cloudinaryPublicId, construct the URL
    if (product.cloudinaryPublicId) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${product.cloudinaryPublicId}`;
    }

    // Fallback to default image
    return FALLBACK_IMAGE;
  } catch (error) {
    console.error('Error in getCloudinaryUrl:', error);
    return FALLBACK_IMAGE;
  }
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