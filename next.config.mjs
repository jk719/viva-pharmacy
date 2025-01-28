import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: false,
  serverExternalPackages: ['nodemailer'],
  webpack: (config, { dev, isServer }) => {
    // Enable top-level await and other ES module features
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true
    }

    // Only enable caching in development
    if (dev) {
      config.cache = {
        type: 'filesystem',
        version: `${isServer ? 'server' : 'client'}-1`,
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
        store: 'pack',
        buildDependencies: {
          config: [__filename]
        }
      }
    } else {
      // Disable cache in production
      config.cache = false
    }

    return config
  }, 
  images: {
    domains: [
      'res.cloudinary.com',
      'www.gravatar.com',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dv3cd1aoy/image/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      }
    ],
    unoptimized: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, stripe-signature' },
          { key: 'Connection', value: 'keep-alive' },
          { key: 'Cache-Control', value: 'no-cache, no-transform' },
          { key: 'X-Accel-Buffering', value: 'no' }
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;