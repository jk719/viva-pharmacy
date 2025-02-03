import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScriptRunner } from './utils/scriptRunner.js';
import { FileOperationManager } from './utils/fileOperationManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const filesToRemove = [
    // Duplicate/temporary scripts
    'scripts/createAdmin.mjs',
    'scripts/tempUserModel.mjs',
    'scripts/testConnection.mjs',
    'scripts/uploadPlaceholder.js',
    'scripts/test-email.js',
    'scripts/test-email.mjs',

    // Default Next.js files
    'public/next.svg',
    'public/vercel.svg',

    // Certificates (uncomment if you're sure they're not needed)
    // 'certificates/localhost-key.pem',
    // 'certificates/localhost.pem',

    // Test files
    'postman_tests/UserCreationTest.postman_collection.json',
];

const directoriesToRemove = [
    'public/images/products',
];

async function removeFile(filePath) {
    try {
        await fs.unlink(path.join(rootDir, filePath));
        console.log(`✅ Removed file: ${filePath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`⚠️  File not found: ${filePath}`);
        } else {
            console.error(`❌ Error removing file ${filePath}:`, error);
        }
    }
}

async function removeDirectory(dirPath) {
    try {
        await fs.rm(path.join(rootDir, dirPath), { recursive: true });
        console.log(`✅ Removed directory: ${dirPath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`⚠️  Directory not found: ${dirPath}`);
        } else {
            console.error(`❌ Error removing directory ${dirPath}:`, error);
        }
    }
}

async function cleanup() {
    const script = new ScriptRunner({ name: 'Cleanup' });
    const fileManager = new FileOperationManager();

    await script.execute(async () => {
        const results = {
            files: { removed: 0, skipped: 0, errors: 0 },
            directories: { removed: 0, skipped: 0, errors: 0 }
        };

        // Remove files
        for (const filePath of filesToRemove) {
            try {
                if (await fileManager.fileExists(filePath)) {
                    await fileManager.removeFile(filePath);
                    results.files.removed++;
                } else {
                    results.files.skipped++;
                }
            } catch (error) {
                console.error(`Failed to remove file ${filePath}:`, error);
                results.files.errors++;
            }
        }

        // Remove directories
        for (const dirPath of directoriesToRemove) {
            try {
                if (await fileManager.fileExists(dirPath)) {
                    await fileManager.removeDirectory(dirPath);
                    results.directories.removed++;
                } else {
                    results.directories.skipped++;
                }
            } catch (error) {
                console.error(`Failed to remove directory ${dirPath}:`, error);
                results.directories.errors++;
            }
        }

        return results;
    });
}

// Run the cleanup
cleanup(); 