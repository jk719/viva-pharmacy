import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/image/upload/**',
      },
      {
        protocol: 'https',
        hostname: process.env.S3_BUCKET_DOMAIN || 'vivapharmacy.s3.amazonaws.com',
        pathname: '/prescriptions/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      }
    ],
    domains: [
      'res.cloudinary.com',
      process.env.S3_BUCKET_DOMAIN || 'vivapharmacy.s3.amazonaws.com',
      'localhost'
    ],
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
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, stripe-signature, X-Payment-Request-ID' },
          { key: 'Connection', value: 'keep-alive' },
          { key: 'Cache-Control', value: 'no-cache, no-transform' },
          { key: 'X-Accel-Buffering', value: 'no' },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
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
      {
        source: '/api/prescriptions/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' https: data:;",
          }
        ],
      },
      {
        source: '/api/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    config.cache = false;

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/components': path.resolve(__dirname, 'components'),
      '@/context': path.resolve(__dirname, 'context'),
    };
    
    config.resolve.modules = [
      path.resolve(__dirname),
      'node_modules',
      ...(config.resolve.modules || []),
    ];

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        path: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
        zlib: false,
        querystring: false,
        buffer: false,
        child_process: false,
        os: false,
        module: false,
      };
    }

    if (dev) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        moduleIds: 'deterministic',
      };
    }

    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '2mb'
    },
    scrollRestoration: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async rewrites() {
    return [
      {
        source: '/rx/:path*',
        destination: '/prescriptions/:path*',
      },
      {
        source: '/prescriptions/verify/:id',
        destination: '/api/prescriptions/verify/:id',
      },
      {
        source: '/prescriptions/upload',
        destination: '/api/prescriptions/upload',
      }
    ];
  },
};

export default nextConfig;