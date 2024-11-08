// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Enable static export
    trailingSlash: true, // Add trailing slashes to links for GitHub Pages compatibility
    images: {
      unoptimized: true // Disable image optimization for GitHub Pages
    },
    basePath: 'viva-pharmacy', // Replace 'your-repo-name' with your GitHub repo name
  };
  
  module.exports = nextConfig;
  