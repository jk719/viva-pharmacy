import { BatchOperationManager } from './batchOperationManager.js';
import { DataValidationManager } from './dataValidationManager.js';
import { ProgressLogger } from './progressLogger.js';

class MigrationManager {
    constructor(options = {}) {
        this.batchManager = new BatchOperationManager(options);
        this.validator = new DataValidationManager();
        this.migrations = new Map();
        this.migrationHistory = [];
    }

    registerMigration(name, {
        validate,
        beforeMigrate,
        migrate,
        afterMigrate,
        rollback
    }) {
        this.migrations.set(name, {
            validate: validate || (() => true),
            beforeMigrate: beforeMigrate || (() => {}),
            migrate,
            afterMigrate: afterMigrate || (() => {}),
            rollback: rollback || (() => {
                throw new Error(`Rollback not implemented for migration: ${name}`);
            })
        });
    }

    async executeMigration(name, data = {}) {
        const migration = this.migrations.get(name);
        if (!migration) {
            throw new Error(`Migration not found: ${name}`);
        }

        const startTime = Date.now();
        console.log(`Starting migration: ${name}`);

        try {
            // Validate
            await migration.validate(data);
            
            // Pre-migration hooks
            await migration.beforeMigrate(data);
            
            // Execute migration
            const result = await migration.migrate(data, this.batchManager);
            
            // Post-migration hooks
            await migration.afterMigrate(result);
            
            // Record success
            this.migrationHistory.push({
                name,
                status: 'success',
                timestamp: new Date(),
                duration: Date.now() - startTime,
                result
            });

            console.log(`Migration completed: ${name}`);
            return result;

        } catch (error) {
            console.error(`Migration failed: ${name}`, error);
            
            // Record failure
            this.migrationHistory.push({
                name,
                status: 'failed',
                timestamp: new Date(),
                duration: Date.now() - startTime,
                error: error.message
            });

            // Attempt rollback
            try {
                await migration.rollback(data);
                console.log(`Rollback completed for: ${name}`);
            } catch (rollbackError) {
                console.error(`Rollback failed for: ${name}`, rollbackError);
            }

            throw error;
        }
    }

    async getMigrationHistory(options = {}) {
        const {
            status,
            startDate,
            endDate
        } = options;

        return this.migrationHistory.filter(record => {
            if (status && record.status !== status) return false;
            if (startDate && record.timestamp < startDate) return false;
            if (endDate && record.timestamp > endDate) return false;
            return true;
        });
    }
}

export default MigrationManager; 