/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fadbde',
        'primary-container': '#fadbde',
        'on-primary': '#0f172a',
        'on-primary-fixed': '#0f172a',
        secondary: '#64748b',
        'secondary-container': '#f1f5f9',
        tertiary: '#f472b6',
        background: '#f8f6f6',
        surface: '#ffffff',
        'surface-container': '#f8f6f6',
        'surface-container-high': '#f3ecec',
        'surface-container-highest': '#ede7e6',
        'on-surface': '#0f172a',
        'on-surface-variant': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}