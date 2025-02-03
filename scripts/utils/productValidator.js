class ProductValidator {
    constructor(options = {}) {
        this.requiredFields = options.requiredFields || [
            'name',
            'categorySlug',
            'price'
        ];
        this.numericFields = options.numericFields || [
            'price'
        ];
        this.slugFields = options.slugFields || [
            'categorySlug',
            'subcategorySlug',
            'itemSlug'
        ];
    }

    validateProduct(product) {
        // Check required fields
        this.requiredFields.forEach(field => {
            if (!product[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        });

        // Validate numeric fields
        this.numericFields.forEach(field => {
            if (product[field] && typeof product[field] !== 'number') {
                throw new Error(`Field ${field} must be a number`);
            }
            if (product[field] < 0) {
                throw new Error(`Field ${field} cannot be negative`);
            }
        });

        // Validate slug fields
        this.slugFields.forEach(field => {
            if (product[field] && !this.isValidSlug(product[field])) {
                throw new Error(`Invalid slug format for ${field}: ${product[field]}`);
            }
        });

        return true;
    }

    isValidSlug(slug) {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    }

    validateBatch(products) {
        const errors = [];
        products.forEach((product, index) => {
            try {
                this.validateProduct(product);
            } catch (error) {
                errors.push({
                    index,
                    product: product.name || `Product ${index}`,
                    error: error.message
                });
            }
        });
        return errors;
    }
}

export default ProductValidator; 