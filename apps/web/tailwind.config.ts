import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New editorial palette
        bg: {
          primary: "#F7F5EB",
          secondary: "#F0EDE1",
          dark: "#171717",
          muted: "#e5e0d8",
        },
        ink: {
          DEFAULT: "#202A2D",
          soft: "#3a4042",
        },
        accent: {
          sage: "#CBD0B5",
          indigo: "#4338ca",
          olive: "#8a8c5a",
          cream: "#fbf8ee",
        },
        line: "#e5e5e5",

        // Legacy keys — preserved so /verify and Blueprint modal still render
        forest: "#01472e",
        sage: "#ccd5ae",
        olive: "#e9edc9",
        cream: "#fefae0",
        moss: "#a3b18a",
        paper: "#f7f5eb",
      },
      fontFamily: {
        // New editorial system
        display: ["var(--font-dm-serif)", "serif"],
        editorial: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        hand: ["var(--font-patrick)", "cursive"],

        // Legacy aliases preserved
        anton: ["var(--font-anton)", "sans-serif"],
        serif: ["var(--font-dm-serif)", "serif"],
        handwritten: ["var(--font-patrick)", "cursive"],
      },
      transitionTimingFunction: {
        bezier: "cubic-bezier(0.22, 1, 0.36, 1)",
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      borderRadius: {
        organic: "32px",
        cinema: "48px",
        editorial: "64px",
      },
      letterSpacing: {
        mono: "0.22em",
        editorial: "0.32em",
      },
      keyframes: {
        "drift-slow": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(-2%, 1%, 0) scale(1.04)" },
        },
        "ray-shimmer": {
          "0%, 100%": { opacity: "0.55", transform: "translateY(0)" },
          "50%": { opacity: "0.8", transform: "translateY(-1.5%)" },
        },
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "marquee-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "gradient-rotate": {
          "0%, 100%": { transform: "rotate(0deg) scale(1.1)" },
          "50%": { transform: "rotate(180deg) scale(1.25)" },
        },
      },
      animation: {
        "drift-slow": "drift-slow 14s ease-in-out infinite",
        "ray-shimmer": "ray-shimmer 7s ease-in-out infinite",
        "fade-rise": "fade-rise 1s cubic-bezier(0.22,1,0.36,1) both",
        "marquee-x": "marquee-x 60s linear infinite",
        "gradient-rotate": "gradient-rotate 28s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
