/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#0f172a',
        },
        legal: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
