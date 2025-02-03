import dotenv from 'dotenv';
import path from 'path';

class EnvironmentManager {
    constructor(options = {}) {
        this.envPath = options.envPath || '.env.local';
        this.requiredVars = options.requiredVars || ['MONGODB_URI'];
        this.loadedVars = new Map();
    }

    initialize() {
        const envPath = path.resolve(process.cwd(), this.envPath);
        const result = dotenv.config({ path: envPath });

        if (result.error) {
            throw new Error(`Error loading environment from ${envPath}: ${result.error.message}`);
        }

        // Store loaded variables
        Object.entries(process.env).forEach(([key, value]) => {
            this.loadedVars.set(key, value);
        });

        this.validateEnvironment();
        return this;
    }

    validateEnvironment() {
        const missing = this.requiredVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            throw new Error(
                `Required environment variables not found in ${this.envPath}:\n` +
                missing.map(name => `- ${name}`).join('\n')
            );
        }
    }

    get(name) {
        const value = process.env[name];
        if (!value && this.requiredVars.includes(name)) {
            throw new Error(`Required environment variable ${name} is not set`);
        }
        return value;
    }

    getAll() {
        return Object.fromEntries(this.loadedVars);
    }

    isDevelopment() {
        return this.get('NODE_ENV') === 'development';
    }

    isProduction() {
        return this.get('NODE_ENV') === 'production';
    }

    isTest() {
        return this.get('NODE_ENV') === 'test';
    }
}

export default EnvironmentManager; 