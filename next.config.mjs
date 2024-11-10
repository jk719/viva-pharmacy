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
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000', // Ensure NEXTAUTH_URL is accessible
  },
  experimental: {
    turbo: false, // Disable Turbopack to use Webpack instead
  },
};

export default nextConfig;
