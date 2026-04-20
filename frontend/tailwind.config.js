/** @type {import('tailwindcss').Config} */
export default {
  // 'class' enables the dark mode toggle via a className on <html> — required
  // by the spec's localStorage-persisted dark mode (Step 12).
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
