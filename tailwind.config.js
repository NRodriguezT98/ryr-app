/** @type {import('tailwindcss').Config} */
export default {
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
        // Definición correcta de fade-slide-down
        'fade-slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Definición correcta de fade-slide-up
        'fade-slide-up': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' }, // Corregido: translateY a -10px para que desaparezca hacia arriba
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "fade-slide-down": "fade-slide-down 0.25s ease-out forwards",
        "fade-slide-up": "fade-slide-up 0.25s ease-in forwards",
      },
      transitionDuration: {
        '250': '250ms', // Para el subrayado animado y otras transiciones
      },
    },
  },
  plugins: [],
};