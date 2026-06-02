/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        'fluid-bg': 'fluidGradient 15s ease infinite',
        'scroll-infinite': 'scrollInfinite 25s linear infinite',
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
        scrollInfinite: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
    },
  },
  plugins: [],
}