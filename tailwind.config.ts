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
          950: "#faf8f4", // page — warm paper white
          900: "#ffffff", // cards / surfaces — pure white
          850: "#f5f1ea", // hover / wells (warm)
          800: "#ede8df", // deeper well
          700: "#e4ddd1", // subtle fills
          600: "#d8cfc0",
        },
        bone: {
          100: "#1a1712", // headings — warm near-black
          300: "#413b33", // body
          400: "#6b6459", // secondary
          500: "#948d80", // muted
        },
        // ONE warm primary — a confident orange (the ClimbX/Daniel-style accent
        // the whole page leans on). Every `accent-*`/`ember-*` mark becomes this.
        accent: {
          400: "#fb8b3d", // light / gradient top / soft fills
          500: "#f2671e", // primary — buttons, marks
          600: "#c2410c", // accessible accent text on white
        },
        ember: {
          400: "#fb8b3d",
          500: "#f2671e",
          600: "#c2410c",
        },
        // Verified / positive — functional green, only on the Verified badge.
        moss: {
          400: "#3f8a5f",
          500: "#2f7a4f",
        },
      },
      fontFamily: {
        // Space Grotesk everywhere for display + body; JetBrains Mono for the
        // small labels, eyebrows and figures that give the page a deliberate,
        // built-by-a-human texture (not template serif).
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Warm, soft elevation on the paper theme.
        card: "0 1px 2px rgba(40,25,10,0.04), 0 8px 20px -12px rgba(40,25,10,0.12), 0 24px 48px -32px rgba(40,25,10,0.16)",
        lift: "0 2px 10px rgba(40,25,10,0.08), 0 26px 60px -24px rgba(40,25,10,0.24)",
        glow: "0 8px 24px -8px rgba(242,103,30,0.45)", // orange CTA glow
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
