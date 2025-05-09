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
        brand: {
          white: '#F2F3F4', // Anti-Flash White
          midnight: '#020035', // Midnight Blue
          lace: '#EBEAED', // Lace Cap
          kimchi: '#ED4B00', // Kimchi
          royalty: '#02066F', // Dark Royalty
          deepsea: '#2000B1', // Deep Sea Exploration
        },
      },
    },
  },
  plugins: [heroui()],
} 