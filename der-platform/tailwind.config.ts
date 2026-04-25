import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0a1628",
          card: "#111d33",
          border: "#1e3a5f",
          light: "#162440",
        },
        accent: "#00d4ff",
      },
    },
  },
  plugins: [],
};
export default config;
