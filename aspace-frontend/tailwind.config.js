/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,wrap}",
  ],
  theme: {
    extend: {
      animation: {
        // animazione fluida di 15 secondi in loop continuo
        'fluid-bg': 'fluidGradient 15s ease infinite',
      },
      keyframes: {
        fluidGradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left top',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right bottom',
          },
        },
      },
    },
  },
  plugins: [],
}