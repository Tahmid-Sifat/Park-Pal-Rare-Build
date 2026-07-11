import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#172026",
        paper: "#f7f4ee",
        fern: "#1f7a5a",
        mint: "#d9f2e7",
        coral: "#e26d5a",
        amber: "#f4b860",
        steel: "#3a506b"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 38, 0.12)",
        glow: "0 30px 90px rgba(31, 122, 90, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
