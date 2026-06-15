/** @type {import('tailwindcss').Config} */
const colors = require('./src/constants/colors');
const fonts = require('./src/constants/fonts');

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'sans-thin': [fonts.thin],
        sans: [fonts.regular],
        'sans-medium': [fonts.medium],
        'sans-bold': [fonts.bold],
        'inter-bold': [fonts.interBold],
      },
      colors,
    },
  },
  plugins: [],
};
