import mongoose from 'mongoose';
import path from 'path';

class ModelLoader {
    constructor() {
        this.modelCache = new Map();
    }

    async getModel(modelName) {
        if (this.modelCache.has(modelName)) {
            return this.modelCache.get(modelName);
        }

        try {
            const modelPath = path.resolve(__dirname, `../../models/${modelName}.js`);
            const modelModule = await import(modelPath);
            const Model = modelModule.default || modelModule;
            
            // Handle both ES modules and CommonJS
            const modelInstance = typeof Model === 'function' ? Model : Model();
            
            this.modelCache.set(modelName, modelInstance);
            return modelInstance;
        } catch (error) {
            console.error(`Error loading model ${modelName}:`, error);
            throw error;
        }
    }

    clearCache() {
        this.modelCache.clear();
    }
}

export default ModelLoader; 