const {heroui} = require('@heroui/theme');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/(input|form).js"
  ],
  theme: {
    fontSize: {
      'xs': ['12px', { lineHeight: '16px' }],
      'sm': ['13px', { lineHeight: '18px' }],
      'base': ['14px', { lineHeight: '20px' }],
      'lg': ['16px', { lineHeight: '24px' }],
      'xl': ['18px', { lineHeight: '28px' }],
      '2xl': ['20px', { lineHeight: '30px' }],
      '3xl': ['24px', { lineHeight: '32px' }],
      '4xl': ['30px', { lineHeight: '36px' }],
      '5xl': ['36px', { lineHeight: '40px' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    extend: {
      colors: {
          'orange': '#fa7f14', // Primary Orange
          'orangeLight': '#ffe5cc', // Light/bright Orange
        },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { 
            opacity: '0.2',
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: '0.4',
            transform: 'scale(1.1)'
          }
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--tw-prose-body)',
            fontSize: '14px',
          },
        },
      },
    }
  },
  plugins: [
    heroui(),
    require('@tailwindcss/typography'),
  ],
} 