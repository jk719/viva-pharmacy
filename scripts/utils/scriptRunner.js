import { EnvironmentManager } from './environmentManager.js';
import { ResourceManager } from './resourceManager.js';
import { ProgressLogger } from './progressLogger.js';

class ScriptRunner {
    constructor(options = {}) {
        this.env = new EnvironmentManager(options.env);
        this.resources = new ResourceManager();
        this.name = options.name || 'Script';
        this.onError = options.onError || this.defaultErrorHandler;
        this.exitOnComplete = options.exitOnComplete !== false;
    }

    async initialize() {
        try {
            this.env.initialize();
            await this.resources.initialize();
            console.log(`${this.name} initialized successfully`);
        } catch (error) {
            await this.handleError(error);
        }
    }

    async execute(operation) {
        const startTime = Date.now();
        let success = false;

        try {
            await this.initialize();
            
            console.log(`Starting ${this.name}...`);
            const result = await operation(this);
            
            const duration = (Date.now() - startTime) / 1000;
            console.log(`\n${this.name} completed successfully in ${duration}s`);
            
            success = true;
            return result;

        } catch (error) {
            await this.handleError(error);
        } finally {
            await this.cleanup(success);
        }
    }

    async handleError(error) {
        console.error(`\n${this.name} failed:`, error);
        await this.onError(error);
        process.exitCode = 1;
    }

    defaultErrorHandler(error) {
        // Default error handling logic
        if (error.code === 'MONGODB_ERROR') {
            console.error('Database error occurred. Please check your connection.');
        } else if (error.code === 'VALIDATION_ERROR') {
            console.error('Data validation failed:', error.details);
        }
    }

    async cleanup(success) {
        try {
            await this.resources.cleanup();
            console.log(`\n${this.name} resources cleaned up`);
        } catch (error) {
            console.error('Error during cleanup:', error);
        } finally {
            if (this.exitOnComplete) {
                process.exit(process.exitCode || (success ? 0 : 1));
            }
        }
    }

    createProgress(options = {}) {
        return new ProgressLogger({
            ...options,
            scriptName: this.name
        });
    }
}

export default ScriptRunner; 