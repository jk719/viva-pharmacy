import { BatchOperationManager } from './batchOperationManager.js';
import { CategoryValidator } from './categoryValidator.js';
import { ProductValidator } from './productValidator.js';

class ProductOperationManager {
    constructor(options = {}) {
        this.batchManager = new BatchOperationManager(options);
        this.categoryValidator = new CategoryValidator();
        this.productValidator = new ProductValidator();
    }

    async updateProductCategories({
        findCriteria,
        categoryData,
        validateCategory = true
    }) {
        if (validateCategory) {
            await this.categoryValidator.validateCategory(categoryData.categorySlug);
        }

        return this.batchManager.executeBatchOperation({
            model: Product,
            query: findCriteria,
            operation: async (product, session) => {
                await Product.findByIdAndUpdate(
                    product._id,
                    {
                        $set: {
                            ...categoryData,
                            updatedAt: new Date()
                        }
                    },
                    { session, runValidators: true }
                );
            }
        });
    }

    async updateProductImages({
        cloudinaryUrls,
        matchFunction,
        batchSize = 50
    }) {
        return this.batchManager.executeBatchOperation({
            model: Product,
            select: '_id name image',
            batchSize,
            operation: async (product, session) => {
                const cloudinaryUrl = matchFunction(product.name, cloudinaryUrls);
                if (cloudinaryUrl && cloudinaryUrl !== product.image) {
                    await Product.findByIdAndUpdate(
                        product._id,
                        {
                            $set: {
                                image: cloudinaryUrl,
                                updatedAt: new Date()
                            }
                        },
                        { session, runValidators: true }
                    );
                }
            }
        });
    }

    async bulkInsertProducts({
        products,
        transformFunction,
        validateBeforeInsert = true
    }) {
        if (validateBeforeInsert) {
            const errors = await this.productValidator.validateBatch(products);
            if (errors.length > 0) {
                throw new Error('Product validation failed:\n' + 
                    errors.map(e => `- ${e.product}: ${e.error}`).join('\n'));
            }
        }

        const transformedProducts = products.map(transformFunction);

        return this.batchManager.executeBatchOperation({
            operation: async (batch, session) => {
                await Product.insertMany(batch, {
                    ordered: false,
                    session,
                    timeout: 30000
                });
            },
            items: transformedProducts
        });
    }

    async verifyUpdates({
        findCriteria,
        expectedCount,
        verifyFunction
    }) {
        const actualCount = await Product.countDocuments(findCriteria);
        
        if (actualCount !== expectedCount) {
            throw new Error(
                `Update verification failed: expected ${expectedCount} but found ${actualCount}`
            );
        }

        if (verifyFunction) {
            const products = await Product.find(findCriteria);
            const verificationErrors = products
                .map(verifyFunction)
                .filter(error => error);

            if (verificationErrors.length > 0) {
                throw new Error(
                    'Update verification failed:\n' + 
                    verificationErrors.join('\n')
                );
            }
        }

        return true;
    }
}

export default ProductOperationManager; 