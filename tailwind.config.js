/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // 한국어 메인 — 기본 sans = NotoSansKR
        sans: ['NotoSansKR_400Regular'],
        'sans-medium': ['NotoSansKR_500Medium'],
        'sans-bold': ['NotoSansKR_700Bold'],
        // 영문 전용 (필요 시): font-latin / font-latin-bold 식으로 사용
        latin: ['NotoSans_400Regular'],
        'latin-medium': ['NotoSans_500Medium'],
        'latin-bold': ['NotoSans_700Bold'],
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
