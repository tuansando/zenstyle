/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zen: {
          50: '#f9f7f4',
          100: '#f3ede3',
          200: '#e7dbc7',
          300: '#d6c3a3',
          400: '#c4a77d',
          500: '#b38f5d',
          600: '#9d7a4f',
          700: '#826243',
          800: '#6b5139',
          900: '#584430',
        },
        cream: '#FFF8F0',
        sage: '#9CAF88',
        earth: '#8B7355',
        stone: '#C9B8A8',
      },
      fontFamily: {
        zen: ['Noto Serif', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
