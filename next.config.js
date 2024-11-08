/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    images: {
        unoptimized: true, // Disable image optimization for easier deployment
    },
    basePath: process.env.NODE_ENV === 'production' ? '/viva-pharmacy' : '',
};

module.exports = nextConfig;
