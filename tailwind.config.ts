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
          950: "#f8f9fb", // page — bright, clean near-white
          900: "#ffffff", // cards / surfaces — pure white
          850: "#f2f3f6", // hover / wells
          800: "#eceef2", // deeper well
          700: "#e3e5ea", // subtle fills
          600: "#d7d9e0",
        },
        bone: {
          100: "#14151a", // headings — near-black, cool
          300: "#3a3b42", // body
          400: "#63646d", // secondary
          500: "#8a8b94", // muted
        },
        // No accent colour at all — pure black & white. `accent-*` (and its
        // `ember-*` alias) resolve to a neutral near-black scale, so every old
        // "accent" mark becomes clean ink instead of a colour. The only colour
        // that survives anywhere is the functional green on the Verified badge.
        accent: {
          400: "#3a3b42", // softer ink — icons
          500: "#14151a", // near-black — eyebrow / marks
          600: "#000000", // pure black — text / hover
        },
        ember: {
          400: "#3a3b42",
          500: "#14151a",
          600: "#000000",
        },
        // Verified / positive — the single functional colour, only on the badge.
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
        // Restrained, neutral elevation — minimal, not glowy.
        card: "0 1px 2px rgba(20,21,26,0.04), 0 6px 16px -10px rgba(20,21,26,0.10), 0 20px 40px -30px rgba(20,21,26,0.14)",
        lift: "0 2px 8px rgba(20,21,26,0.06), 0 22px 50px -22px rgba(20,21,26,0.20)",
        glow: "0 0 0 1px rgba(79,70,229,0.12), 0 24px 70px -26px rgba(79,70,229,0.22)",
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
