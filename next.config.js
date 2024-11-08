/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true, // Add trailing slashes for GitHub Pages compatibility
    images: {
        unoptimized: true // Disable image optimization for GitHub Pages
    },
    basePath: '/viva-pharmacy', // Update this if your GitHub repo name is different
};

module.exports = nextConfig;
