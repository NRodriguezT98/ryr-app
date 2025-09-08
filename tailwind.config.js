/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
  // --- INICIO DE LA MODIFICACIÓN ---
  darkMode: 'class', // Habilitamos la estrategia de clase para el modo oscuro
  // --- FIN DE LA MODIFICACIÓN ---
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        'fade-slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-slide-up': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'ring': {
          '0%, 100%': { transform: 'rotate(0)' },
          '10%, 50%, 90%': { transform: 'rotate(-15deg)' },
          '30%, 70%': { transform: 'rotate(15deg)' },
        },
        'pulse-once': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "fade-slide-down": "fade-slide-down 0.25s ease-out forwards",
        "fade-slide-up": "fade-slide-up 0.25s ease-in forwards",
        'ring': 'ring 0.5s ease-in-out',
        'pulse-once': 'pulse-once 1.5s ease-out',
      },
    },
    fontFamily: {
      montserrat: ['Montserrat', 'sans-serif'],
    },
  },
  plugins: [],
};