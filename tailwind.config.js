/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: {
        primary: colors.pink,
        accent: colors.emerald,
        secondary: colors.gray,
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, config }) {
      addBase({
        h1: { fontSize: config("theme.fontSize.5xl") },
        h2: { fontSize: config("theme.fontSize.4xl") },
        h3: { fontSize: config("theme.fontSize.3xl") },
        h4: { fontSize: config("theme.fontSize.2xl") },
        h5: { fontSize: config("theme.fontSize.xl") },
        h6: { fontSize: config("theme.fontSize.lg") },
      });
    }),
  ],
};
