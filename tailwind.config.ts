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
        // Saasgrave — a premium, editorial LIGHT theme. Warm paper canvas,
        // crisp white cards, ink-black type, and a single restrained gold
        // accent. The `ink` scale now names *surfaces* (paper → white → warm
        // wells) and `bone` names *type* (near-black → muted), so existing
        // markup keeps its intent as the theme reads light.
        ink: {
          950: "#f6f3ec", // page — warm paper
          900: "#ffffff", // cards / surfaces
          850: "#f4f1e8", // hover / wells
          800: "#efeae0", // deeper well
          700: "#e7e1d4", // subtle fills
          600: "#ddd6c6",
        },
        bone: {
          100: "#17140f", // headings — near-black, warm
          300: "#413c34", // body
          400: "#6c6659", // secondary
          500: "#8f897b", // muted
        },
        // Premium gold-bronze accent, tuned to read on white.
        accent: {
          400: "#b07d2b", // icons / soft accent
          500: "#986617", // primary accent / eyebrow
          600: "#7a4f11", // text on light
        },
        ember: {
          400: "#b07d2b",
          500: "#986617",
          600: "#7a4f11",
        },
        // Verified / positive — a deep, calm green that holds on white.
        moss: {
          400: "#4f7a5e",
          500: "#3f6a4e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        // Soft, editorial elevation for the light theme.
        card: "0 1px 2px rgba(23,20,15,0.04), 0 8px 24px -12px rgba(23,20,15,0.10)",
        lift: "0 10px 40px -12px rgba(23,20,15,0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.55" },
          "50%": { transform: "translate3d(3%,-4%,0) scale(1.12)", opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 1s ease forwards",
        marquee: "marquee var(--marquee-dur, 40s) linear infinite",
        aurora: "aurora 14s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
