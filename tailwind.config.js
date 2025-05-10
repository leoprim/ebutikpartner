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
    extend: {
      colors: {
          'orange': '#fa7f14', // Primary Orange
          'orangeLight': '#ffe5cc', // Light/bright Orange
        },
    }
  },
  plugins: [heroui()],
} 