/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        // Deep greens
        deep: {
          900: '#0d2f20',
          800: '#14401f',
          700: '#1a5c31',
          600: '#1e7a3a',
        },
        // Fresh greens
        fresh: {
          500: '#2ea848',
          400: '#46c05b',
          300: '#6fdb80',
        },
        // Earth tones
        earth: {
          700: '#7a4b1c',
          600: '#96601f',
          500: '#b07a2b',
          400: '#c79a4b',
          300: '#ddba77',
        },
        // Neutral grays
        neutral: {
          50: '#f8faf8',
          100: '#f1f5f0',
          200: '#e2e8e1',
          300: '#cbd5ca',
          400: '#94a39b',
          500: '#64756d',
          600: '#475a52',
          700: '#33453e',
          800: '#22322c',
          900: '#101c17',
        },
        // Semantic
        brand: {
          DEFAULT: '#1e7a3a',
          hover: '#1a5c31',
          light: '#46c05b',
        },
        success: '#1e7a3a',
        warning: '#b07a2b',
        danger: '#b3402e',
        info: '#2a6ea8',
      },
      fontFamily: {
        sans: ['"Inter"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,28,23,0.08), 0 4px 16px rgba(16,28,23,0.06)',
        'card-hover': '0 4px 12px rgba(16,28,23,0.12), 0 12px 32px rgba(16,28,23,0.10)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
