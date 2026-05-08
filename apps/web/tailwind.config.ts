import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#01472e",
        sage: "#ccd5ae",
        olive: "#e9edc9",
        cream: "#fefae0",
        moss: "#a3b18a",
        paper: "#f7f5eb",
      },
      fontFamily: {
        anton: ["var(--font-anton)", "sans-serif"],
        serif: ["var(--font-dm-serif)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        handwritten: ["var(--font-reenie)", "cursive"],
      },
      transitionTimingFunction: {
        bezier: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
