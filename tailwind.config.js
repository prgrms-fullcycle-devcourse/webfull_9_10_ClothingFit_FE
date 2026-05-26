/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['NotoSans_400Regular'],
        'sans-medium': ['NotoSans_500Medium'],
        'sans-bold': ['NotoSans_700Bold'],
      },
      colors: {
        primary: '#111827',
        accent: '#2563eb',
        muted: '#6b7280',
        border: '#e5e7eb',
        surface: '#f9fafb',
      },
    },
  },
  plugins: [],
};
