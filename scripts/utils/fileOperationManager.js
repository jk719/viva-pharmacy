import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class FileOperationManager {
    constructor(options = {}) {
        this.basePath = options.basePath || process.cwd();
        this.dataDir = options.dataDir || 'data';
        this.cache = new Map();
    }

    async readJsonFile(filename, options = {}) {
        const {
            cache = true,
            validate,
            required = true
        } = options;

        const cacheKey = `json:${filename}`;
        if (cache && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const filePath = path.join(this.basePath, this.dataDir, filename);
        
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);

            if (validate) {
                await validate(data);
            }

            if (cache) {
                this.cache.set(cacheKey, data);
            }

            return data;
        } catch (error) {
            if (error.code === 'ENOENT' && !required) {
                return null;
            }
            throw new Error(`Error reading ${filename}: ${error.message}`);
        }
    }

    async writeJsonFile(filename, data, options = {}) {
        const {
            pretty = true,
            backup = true,
            validate
        } = options;

        if (validate) {
            await validate(data);
        }

        const filePath = path.join(this.basePath, this.dataDir, filename);
        
        if (backup && await this.fileExists(filePath)) {
            const backupPath = `${filePath}.${Date.now()}.backup`;
            await fs.copyFile(filePath, backupPath);
        }

        const content = pretty 
            ? JSON.stringify(data, null, 2)
            : JSON.stringify(data);

        await fs.writeFile(filePath, content, 'utf8');
        this.cache.delete(`json:${filename}`);
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async loadDataFiles(files, options = {}) {
        const results = {};
        const errors = [];

        for (const [key, filename] of Object.entries(files)) {
            try {
                results[key] = await this.readJsonFile(filename, options);
            } catch (error) {
                errors.push(`${filename}: ${error.message}`);
            }
        }

        if (errors.length > 0) {
            throw new Error('Failed to load data files:\n' + errors.join('\n'));
        }

        return results;
    }

    getScriptPath(importMetaUrl) {
        const filename = fileURLToPath(importMetaUrl);
        return {
            filename,
            dirname: path.dirname(filename)
        };
    }

    clearCache() {
        this.cache.clear();
    }
}

export default FileOperationManager; 