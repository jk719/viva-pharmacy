/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}', // Include all files in the "app" directory
    './src/components/**/*.{js,ts,jsx,tsx}' // If you're using components, include them too
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
