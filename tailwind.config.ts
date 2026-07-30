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
        // Saasgrave — a warm "marble / memorial" light theme. Paper canvas,
        // dark ink text, a single restrained evergreen accent.
        canvas: "#f4f3ee", // page background (warm paper / stone)
        card: "#ffffff", // raised surfaces
        sunken: "#eceae2", // subtle fills / hovers
        line: {
          DEFAULT: "#e4e1d7", // hairline borders
          strong: "#d3cfc2",
        },
        ink: {
          DEFAULT: "#1c1b17", // primary text
          soft: "#54524b", // secondary text
          faint: "#8b877d", // tertiary / captions
        },
        accent: {
          400: "#4f7d64",
          500: "#3c6650",
          600: "#2d4e3d",
        },
        moss: {
          400: "#3c6650",
          500: "#2d4e3d",
        },
        honey: {
          400: "#c1852f",
          500: "#a06d24",
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
