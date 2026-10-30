/** @type {import('tailwindcss').Config} */

// Los grises y el azul "marca" salen de variables CSS (ver src/index.css),
// así el mismo código se ve en modo noche o en modo día.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Colores del escudo de Chancay F6
        club: {
          blue: '#0040b0',
          red: '#e80008',
          ink: '#081018',
        },
        // Texto principal: blanco de noche, azul casi negro de día
        ink: v('ink'),
        slate: {
          50: v('slate-50'),
          100: v('slate-100'),
          200: v('slate-200'),
          300: v('slate-300'),
          400: v('slate-400'),
          500: v('slate-500'),
          600: v('slate-600'),
          700: v('slate-700'),
          800: v('slate-800'),
          850: v('slate-850'),
          900: v('slate-900'),
          950: v('slate-950'),
        },
        // Azul del club (reemplaza al verde anterior)
        brand: {
          50: '#eef4ff',
          100: '#dbe8ff',
          200: '#bad2ff',
          300: v('brand-300'),
          400: v('brand-400'),
          500: '#1f5fd1',
          600: '#0040b0',
          700: '#003594',
          800: '#002a75',
          900: '#001f57',
          950: '#001237',
        },
        pitch: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#22c55e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
