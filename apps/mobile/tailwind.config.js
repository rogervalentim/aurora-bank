/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: '#F8FAFC',
        ink: '#0F172A',
        accent: '#10B981',
        warn: '#F59E0B',
        danger: '#EF4444',
        line: '#E2E8F0',
        muted: '#64748B',
        card: '#FFFFFF',
        navy: '#0B1220',
      },
    },
  },
  plugins: [],
};
