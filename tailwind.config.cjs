/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'oklch(0.15 0.01 200)',
          800: 'oklch(0.25 0.01 200)',
          700: 'oklch(0.35 0.01 200)',
        }
      }
    },
  },
  plugins: [],
}
