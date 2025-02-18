export const FALLBACK_IMAGE = 'https://res.cloudinary.com/dv3cd1aoy/image/upload/v1737391942/viva-pharmacy/products/placeholder.svg';

export function getCloudinaryUrl(publicId) {
  if (!publicId) return FALLBACK_IMAGE;
  // Remove any leading slashes from publicId
  const cleanPublicId = publicId.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${cleanPublicId}`;
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