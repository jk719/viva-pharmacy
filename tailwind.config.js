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
          DEFAULT: '#002B49',
          light: '#003d68',
          dark: '#001f35',
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
        },
        form: {
          input: {
            border: '#E5E7EB',
            focus: '#3B82F6',
            error: '#EF4444',
            success: '#10B981',
          },
          label: '#374151',
          placeholder: '#9CA3AF',
        },
        dropzone: {
          active: '#DBEAFE',
          border: {
            DEFAULT: '#E5E7EB',
            active: '#60A5FA',
          },
        }
      },
      spacing: {
        '4.5': '1.125rem',
      },
      borderRadius: {
        'lg-xl': '0.625rem',
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
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.2s ease-out',
        modalSlide: 'modalSlide 0.3s ease-out',
        scaleSpring: 'scaleSpring 0.3s ease-out',
        modalAppear: 'modalAppear 0.2s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'bounce-once': 'bounce 0.5s ease-in-out 1',
        'slide-up': 'slideUp 0.2s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
