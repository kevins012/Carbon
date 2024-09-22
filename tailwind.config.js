/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./root/**/*.{html,js}'],
  darkMode:'class',
  theme: {

    extend: {
      spacing: {
       '13':'48px'
      },
      fontFamily:{
        Jacquarda: ['"Jacquarda Bastarda 9"', 'serif'], 
      }
    },
  },
  plugins: [],
}

