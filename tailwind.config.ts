import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Graveyard — a quiet, premium near-black canvas with an ember accent.
        ink: {
          950: "#08080a",
          900: "#0a0a0c",
          850: "#0f0f12",
          800: "#141418",
          700: "#1c1c22",
          600: "#26262e",
        },
        bone: {
          100: "#f5f4f1",
          300: "#c9c7c1",
          500: "#8b8983",
        },
        ember: {
          400: "#e8a56b",
          500: "#d98a45",
          600: "#c2732f",
        },
        moss: {
          400: "#7ea88a",
          500: "#5f8a6b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 1s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
