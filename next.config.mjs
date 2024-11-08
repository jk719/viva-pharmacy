import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        // Disable Webpack file system cache to avoid caching issues
        config.cache = false;
        return config;
    },
};

export default nextConfig;
