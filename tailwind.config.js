/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#128C7E", // WhatsApp-like green
        primaryDark: "#075E54",
        accent: "#25D366",
        paper: "#111b21",
        card: "#1f2c33"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.2)"
      }
    },
  },
  plugins: [],
}
