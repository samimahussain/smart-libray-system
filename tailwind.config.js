/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brandBg: '#E9E4D0',       // beige background
        brandSurface: '#FFFFFF', // cards
        brandText: '#1F2937',     // slate-800
        brandMuted: '#6B7280',    // slate-500
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}