import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true, // Set this to false if you don’t need trailing slashes
  images: {
    unoptimized: true, // Useful if image optimization is not needed or handled externally
  },
  env: {
    // Set NEXTAUTH_URL based on environment
    NEXTAUTH_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
  },
  webpack: (config) => {
    config.cache = false; // Only needed if caching issues arise
    return config;
  },
  productionBrowserSourceMaps: true, // Helps with debugging in production if needed
};

export default nextConfig;
