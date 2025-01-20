import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.log('Starting cleanup...\n');

    // Remove individual files
    for (const file of filesToRemove) {
        await removeFile(file);
    }

    // Remove directories
    for (const dir of directoriesToRemove) {
        await removeDirectory(dir);
    }

    console.log('\nCleanup complete!');
}

// Run the cleanup
cleanup(); 