import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crust: "#f5ead6",
        dough: "#fbf4e6",
        tomato: "#c0392b",
        tomatoDark: "#8e2b20",
        basil: "#3d7a4e",
        charcoal: "#2b2622",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
