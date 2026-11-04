/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Palanquin', 'sans-serif'],
        palanquin: ['Palanquin', 'sans-serif'],
        'palanquin-dark': ['"Palanquin Dark"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#e6fbf2',
          100: '#c0f7de',
          400: '#1fd98d',
          500: '#00C076',
          600: '#00aa67',
          700: '#008b53',
          dark: '#013824'
        },
        surface: {
          light: '#F8F9FA',
          canvas: '#EBECEF',
          card: '#FFFFFF',
          dark: '#141416',
          tableHeader: '#1A1C1E',
        }
      }
    },
  },
  plugins: [],
}

