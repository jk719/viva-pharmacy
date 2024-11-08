import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Enable static export
    trailingSlash: true, // Add trailing slashes to URLs
    images: {
        unoptimized: true, // Disable image optimization for GitHub Pages
    },
    basePath: '/your-repo-name', // Replace 'your-repo-name' with the name of your GitHub repo

    webpack: (config) => {
        // Disable Webpack file system cache to avoid caching issues
        config.cache = false;
        return config;
    },
};

export default nextConfig;
