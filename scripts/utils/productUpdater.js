import { DatabaseOperationManager } from './databaseOperationManager.js';
import { DataValidationManager } from './dataValidationManager.js';
import { SessionManager } from './sessionManager.js';
import { BatchProcessor } from './batchProcessor.js';

class ProductUpdater {
    constructor() {
        this.dbManager = new DatabaseOperationManager();
        this.validator = new DataValidationManager();
        this.sessionManager = new SessionManager();
        this.batchProcessor = new BatchProcessor();
    }

    async updateProductCategories(options) {
        const {
            findCriteria,
            updateData,
            validateCategory = true
        } = options;

        return this.sessionManager.withSession(async (session) => {
            if (validateCategory) {
                await this.validator.validate('category', {
                    categorySlug: updateData.categorySlug
                });
            }

            return this.dbManager.bulkOperation({
                model: Product,
                findCriteria,
                updateData: {
                    ...updateData,
                    updatedAt: new Date()
                },
                options: { session, runValidators: true }
            });
        });
    }

    async updateProductImages(options) {
        const {
            cloudinaryUrls,
            matchFunction
        } = options;

        await this.validator.validate('cloudinaryUrls', cloudinaryUrls);

        return this.dbManager.withCursor({
            model: Product,
            batchSize: 50,
            operation: async (product, session) => {
                const cloudinaryUrl = matchFunction(product.name, cloudinaryUrls);
                if (!cloudinaryUrl || cloudinaryUrl === product.image) {
                    return 'skipped';
                }

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
                return 'updated';
            }
        });
    }
}

export default ProductUpdater; 