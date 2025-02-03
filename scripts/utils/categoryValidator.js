import { categories } from '../../data/categories.js';

class CategoryValidator {
    constructor() {
        if (!Array.isArray(categories) || categories.length === 0) {
            throw new Error('Categories data is invalid or empty');
        }
        this.categories = categories;
    }

    validateCategory(categorySlug) {
        const category = this.categories.find(c => c.slug === categorySlug);
        if (!category) {
            throw new Error(`Invalid category slug: ${categorySlug}`);
        }
        return category;
    }

    validateMapping(mapping) {
        if (!mapping || !mapping.category || !mapping.item) {
            throw new Error('Invalid category mapping structure');
        }

        const category = this.categories.find(c => c.name === mapping.category);
        if (!category) {
            throw new Error(`Invalid category in mapping: ${mapping.category}`);
        }

        const item = category.items?.find(i => i.name === mapping.item);
        if (!item) {
            throw new Error(`Invalid item in mapping: ${mapping.item}`);
        }

        return { category, item };
    }

    findCategoryByProduct(product) {
        const category = this.categories.find(c => c.slug === product.categorySlug);
        if (!category) {
            console.warn(`No category found for product: ${product.name}`);
            return null;
        }
        return category;
    }
}

export default CategoryValidator; 