/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      colors: {
        deep: '#0E3A53',
        teal: '#1E6F8E',
        glacier: '#7FC6DC',
        ember: '#D96C4A',
        forest: '#2E7D5B',
        sand: '#F5F0E6'
      }
    }
  },
  plugins: []
};
