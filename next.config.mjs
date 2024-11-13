import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true, // Enable trailing slashes for routes
  images: {
    unoptimized: true, // Disable image optimization if needed for static exports
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000', // Use the appropriate NEXTAUTH_URL for your environment
  },
  experimental: {
    turbo: false, // Disable TurboPack for stable Webpack usage
  },
  webpack: (config) => {
    config.cache = false; // Turn off caching to prevent potential stale builds
    return config;
  },
};

export default nextConfig;
