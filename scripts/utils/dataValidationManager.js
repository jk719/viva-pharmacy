class DataValidationManager {
    constructor(options = {}) {
        this.validators = new Map();
        this.setupDefaultValidators();
    }

    setupDefaultValidators() {
        this.addValidator('environment', (env) => {
            const requiredVars = ['MONGODB_URI'];
            const missing = requiredVars.filter(v => !env[v]);
            if (missing.length > 0) {
                throw new Error(`Missing environment variables: ${missing.join(', ')}`);
            }
        });

        this.addValidator('categories', (categories) => {
            if (!Array.isArray(categories) || categories.length === 0) {
                throw new Error('Categories data is invalid or empty');
            }
            
            categories.forEach((category, index) => {
                if (!category.slug || !category.name) {
                    throw new Error(`Invalid category at index ${index}`);
                }
            });
        });

        this.addValidator('mappings', (mappings) => {
            if (!mappings || typeof mappings !== 'object') {
                throw new Error('Invalid mappings structure');
            }
            
            Object.entries(mappings).forEach(([key, value]) => {
                if (!value || typeof value !== 'object') {
                    throw new Error(`Invalid mapping for key: ${key}`);
                }
            });
        });

        this.addValidator('cloudinaryUrls', (urls) => {
            if (!urls || typeof urls !== 'object') {
                throw new Error('Invalid Cloudinary URLs data');
            }
            
            Object.entries(urls).forEach(([key, value]) => {
                if (!value || typeof value !== 'string') {
                    throw new Error(`Invalid Cloudinary URL for: ${key}`);
                }
                if (!value.startsWith('https://res.cloudinary.com/')) {
                    throw new Error(`Invalid Cloudinary URL format for: ${key}`);
                }
            });
        });
    }

    addValidator(name, validatorFn) {
        this.validators.set(name, validatorFn);
    }

    async validate(name, data) {
        const validator = this.validators.get(name);
        if (!validator) {
            throw new Error(`No validator found for: ${name}`);
        }
        await validator(data);
    }

    async validateAll(dataMap) {
        const errors = [];
        
        for (const [name, data] of Object.entries(dataMap)) {
            try {
                await this.validate(name, data);
            } catch (error) {
                errors.push({ name, error: error.message });
            }
        }
        
        if (errors.length > 0) {
            throw new Error('Validation failed:\n' + 
                errors.map(e => `- ${e.name}: ${e.error}`).join('\n'));
        }
    }
}

export default DataValidationManager; 