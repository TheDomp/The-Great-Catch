/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#166534', // green-800
          foreground: '#f0fdf4',
        },
        secondary: {
          DEFAULT: '#ea580c', // orange-600
          foreground: '#fff7ed',
        },
        background: '#0f172a', // slate-900
        surface: '#1e293b', // slate-800
        muted: '#64748b', // slate-500
      }
    },
  },
  plugins: [],
}

