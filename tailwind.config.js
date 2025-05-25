// tailwind.config.js
const {heroui} = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // ...
    // make sure it's pointing to the ROOT node_module
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}", // <- Lägg till denna rad
    "./app/**/*.{js,ts,jsx,tsx}",
"./components/**/*.{js,ts,jsx,tsx}",


  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};