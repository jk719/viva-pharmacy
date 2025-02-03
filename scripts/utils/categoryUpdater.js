import { DatabaseOperationManager } from './databaseOperationManager.js';
import { DataValidationManager } from './dataValidationManager.js';
import { SessionManager } from './sessionManager.js';

export async function updateProductCategory({
    findCriteria,
    updateData,
    validateCategory = true
}) {
    const dbManager = new DatabaseOperationManager();
    const validator = new DataValidationManager();
    const sessionManager = new SessionManager();

    return sessionManager.withSession(async (session) => {
        if (validateCategory && updateData.categorySlug) {
            await validator.validate('category', {
                categorySlug: updateData.categorySlug
            });
        }

        return dbManager.bulkOperation({
            model: Product,
            findCriteria,
            updateData: {
                ...updateData,
                updatedAt: new Date()
            },
            options: {
                session,
                runValidators: true
            }
        });
    });
}

module.exports = { updateProductCategory }; 