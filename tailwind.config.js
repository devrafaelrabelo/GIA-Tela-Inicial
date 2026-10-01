/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-page)',
        foreground: 'var(--text-main)',
        card: {
          DEFAULT: 'var(--bg-card)',
          foreground: 'var(--text-main)'
        },
        border: 'var(--border-card)',
        muted: {
          DEFAULT: '#f3ece7',
          foreground: '#786e6f'
        },
        brand: {
          50: '#fdf2f4',
          100: '#fbe6ea',
          200: '#f7d0d8',
          300: '#f0aab9',
          400: '#e47690',
          500: '#d3486c',
          600: '#bc2e53',
          700: '#9e1f3f',
          800: '#841c37',
          900: '#721b33',
          950: '#400918',
          wine: '#7c172e',
          amber: '#d97706',
        }
      }
    },
  },
  plugins: [],
}
