/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "tech-navy": "#020617",
        "accent-blue": "#0ea5e9",
        "glow-blue": "#3b82f6",
        "background-light": "#f8fafc",
        "background-dark": "#101922",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "Lexend", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

