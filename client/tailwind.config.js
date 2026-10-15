/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          cyan: '#00D2FE',
          blue: '#2563EB',
          dark: '#0B0F17',
          surface: '#111827',
          card: '#161F30',
          border: '#1E293B',
          hover: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(0, 210, 254, 0.25)',
        'glow-blue': '0 0 15px -3px rgba(37, 99, 235, 0.25)',
      }
    },
  },
  plugins: [],
}
