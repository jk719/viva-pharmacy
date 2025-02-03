import { FileOperationManager } from './fileOperationManager.js';
import { DataValidationManager } from './dataValidationManager.js';
import path from 'path';

class DataLoader {
    constructor() {
        this.fileManager = new FileOperationManager();
        this.validator = new DataValidationManager();
        this.dataCache = new Map();
    }

    async loadData(options) {
        const {
            filename,
            type,
            validate = true,
            cache = true
        } = options;

        const cacheKey = `${type}:${filename}`;
        if (cache && this.dataCache.has(cacheKey)) {
            return this.dataCache.get(cacheKey);
        }

        try {
            const data = await this.fileManager.readJsonFile(filename, {
                validate: validate ? (data) => this.validator.validate(type, data) : undefined
            });

            if (cache) {
                this.dataCache.set(cacheKey, data);
            }

            return data;
        } catch (error) {
            console.error(`Error loading ${type} data from ${filename}:`, error);
            throw error;
        }
    }

    clearCache() {
        this.dataCache.clear();
    }
}

export default DataLoader; 