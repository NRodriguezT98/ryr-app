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
        "fade-slide-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-12px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-slide-up": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-12px)",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "fade-slide-down": "fade-slide-down 0.25s ease-out forwards",
        "fade-slide-up": "fade-slide-up 0.25s ease-in forwards",
      },
    },
  },
  plugins: [],
};
