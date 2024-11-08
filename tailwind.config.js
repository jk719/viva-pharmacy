/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primaryYellow: '#F7CF2D',  // Yellow in the header
        primaryRed: '#D62839',     // Red for buttons
        primaryBlue: '#0B61C6',    // Blue for banner
        primaryText: '#2E2E2E',    // Dark grey for text
        backgroundGray: '#F5F5F5', // Light gray background for sections
      },
    },
  },
  plugins: [],
};
