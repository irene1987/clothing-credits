/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      colors: {
        brand: {
          50:  '#fff1f3',
          100: '#ffe1e5',
          200: '#ffc6cc',
          300: '#ff8d9a',
          400: '#ff5068',
          500: '#e82040',
          600: '#c42040',
          700: '#b82439',
          800: '#9e1e31',
          900: '#851929',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
      },
    },
  },
  plugins: [],
}
