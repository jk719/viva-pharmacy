const validateCategories = (categories) => {
    if (!Array.isArray(categories) || categories.length === 0) {
        throw new Error('Categories data is invalid or empty');
    }

    // Validate required fields
    categories.forEach((category, index) => {
        if (!category.slug) {
            throw new Error(`Category at index ${index} is missing slug`);
        }
        if (!category.name) {
            throw new Error(`Category at index ${index} is missing name`);
        }
        if (!category.tagline) {
            throw new Error(`Category at index ${index} is missing tagline`);
        }
    });

    return true;
};

const validateProductData = (product) => {
    const requiredFields = ['name', 'categorySlug', 'price'];
    
    requiredFields.forEach(field => {
        if (!product[field]) {
            throw new Error(`Product is missing required field: ${field}`);
        }
    });

    if (typeof product.price !== 'number' || product.price < 0) {
        throw new Error('Product price must be a positive number');
    }

    return true;
};

const validateCloudinaryUrls = (urls) => {
    if (!urls || typeof urls !== 'object') {
        throw new Error('Invalid Cloudinary URLs data structure');
    }

    Object.entries(urls).forEach(([key, value]) => {
        if (typeof value !== 'string' || !value.includes('cloudinary.com')) {
            throw new Error(`Invalid Cloudinary URL for key: ${key}`);
        }
    });

    return true;
};

module.exports = {
    validateCategories,
    validateProductData,
    validateCloudinaryUrls
}; 