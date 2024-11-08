// next.config.mjs
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: '/viva-pharmacy',
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
