export const FALLBACK_IMAGE = '/images/placeholder.png';

export function getCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return FALLBACK_IMAGE;
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.error('Cloudinary cloud name not configured');
    return FALLBACK_IMAGE;
  }

  try {
    // Remove any existing Cloudinary URLs or leading slashes
    const cleanPublicId = publicId
      .replace(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '')
      .replace(/^\/+/, '');

    // Build transformation string
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality || 'auto'}`);
    if (options.format) transformations.push(`f_${options.format || 'auto'}`);
    
    const transformString = transformations.length > 0 
      ? transformations.join(',') + '/'
      : '';

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${cleanPublicId}`;
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
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