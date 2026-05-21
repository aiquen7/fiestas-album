/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fiesta: {
          cream: '#F5E6D3',
          'cream-light': '#FDF5E6',
          burgundy: '#800020',
          'burgundy-dark': '#5C0015',
          wine: '#8B0000',
          blossom: '#B22222',
        },
      },
      fontFamily: {
        script: ['"Great Vibes"', 'cursive'],
      },
      boxShadow: {
        fiesta: '0 20px 60px rgba(92, 0, 21, 0.12)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}