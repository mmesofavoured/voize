module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        voize: {
          50:  '#f0f0ff',
          100: '#e0e0fe',
          400: '#8B83FF',
          500: '#6C63FF',
          600: '#5A52E0',
          700: '#4440C0',
          900: '#1a1830',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}