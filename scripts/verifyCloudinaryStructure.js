const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listFolderStructure(path = '') {
  try {
    console.log(`Checking structure for: ${path || 'root'}`);
    
    // Get folder structure
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: path,
      max_results: 500
    });
    
    console.log(`Found ${result.resources.length} resources`);
    
    // Save sample URLs to a file
    const sampleUrls = result.resources.slice(0, 10).map(resource => ({
      public_id: resource.public_id,
      url: resource.secure_url
    }));
    
    fs.writeFileSync('cloudinary-structure.json', JSON.stringify(sampleUrls, null, 2));
    console.log('Saved sample URLs to cloudinary-structure.json');
    
    return sampleUrls;
  } catch (error) {
    console.error('Error listing Cloudinary resources:', error);
    return [];
  }
}

// Run the function with your expected product image path
listFolderStructure('viva-pharmacy/products'); 