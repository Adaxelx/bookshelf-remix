/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: colors.pink,
        secondary: colors.emerald,
        text: colors.gray,
      },
    },
  },
  plugins: [],
};
