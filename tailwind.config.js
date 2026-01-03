/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The "Classy" Dark Palette
        background: "#09090b", 
        surface: "#18181b",
        surfaceHighlight: "#27272a",
        border: "#3f3f46",
        primary: "#3b82f6", // Royal Blue
        leetcode: "#ffa116",
        codeforces: "#3182ce", 
        atcoder: "#ffffff", // Changed to white for visibility on dark
        codechef: "#ca8a04", // Yellow-600 equivalent
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}