/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'agri-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'earth': {
          50: '#faf8f5',
          100: '#f5f1e8',
          200: '#e8dcc8',
          300: '#d4c2a0',
          400: '#b89d6f',
          500: '#9d7f4f',
          600: '#7d6540',
          700: '#5d4b30',
          800: '#3d3220',
          900: '#1d1910',
        },
      },
    },
  },
  plugins: [],
}

