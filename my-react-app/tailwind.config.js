/** @type {import('tailwindcss').Config} */
export default {
  // THIS LINE IS CRUCIAL: It tells Tailwind to scan all your React components
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        15: "repeat(15, minmax(0, 1fr))",
      },
      gridTemplateRows: {
        15: "repeat(15, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};
