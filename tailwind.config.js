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
      keyframes: {
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        slideDown: 'slideDown 0.2s ease-out'
      }
    },
  },
  plugins: [],
};
