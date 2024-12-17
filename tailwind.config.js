/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366',
          light: '#004d99',
          dark: '#002347',
        },
        secondary: '#F1F5F9',
        accent: {
          red: '#D62839',
          yellow: '#F7CF2D',
          blue: '#0B61C6',
        },
        text: {
          primary: '#2E2E2E',
          secondary: '#6B7280',
        }
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        modalSlide: {
          '0%': { opacity: 0, transform: 'translate(-50%, -60%)' },
          '100%': { opacity: 1, transform: 'translate(-50%, -50%)' }
        },
        scaleSpring: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: 1 }
        },
        modalAppear: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        slideDown: 'slideDown 0.2s ease-out',
        modalSlide: 'modalSlide 0.3s ease-out',
        scaleSpring: 'scaleSpring 0.3s ease-out',
        modalAppear: 'modalAppear 0.2s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};
