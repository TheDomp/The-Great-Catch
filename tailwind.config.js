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
          DEFAULT: '#0369A1', // Darker Sky Blue for contrast (WCAG AA pass with white)
          dark: '#075985',
          light: '#7DD3FC', // For contrast on dark backgrounds
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#94A3B8', // Silver/Slate
          foreground: '#F8FAFC',
        },
        accent: '#FFD700', // Gold for premium touches
        background: '#1E3A8A', // Indigo Blue (lighter)
        surface: '#023E8A', // Strong Blue
        'surface-light': '#0077B6',
        muted: '#CBD5E1', // Slate-300 for higher contrast
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #03045E 0%, #0077B6 100%)',
        'glass-gradient': 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'cyan-glow': '0 0 20px rgba(0, 180, 216, 0.3)',
      }
    },
  },
  plugins: [],
}

