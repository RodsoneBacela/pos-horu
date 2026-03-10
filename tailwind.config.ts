import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
        mono:  ["var(--font-mono)", "monospace"],
        serif: ["var(--font-serif)", "serif"],
      },
      colors: {
        brand: {
          50:  "#eff4ff",
          100: "#dbe8fe",
          200: "#bfd3fe",
          300: "#93b4fd",
          400: "#6090fa",
          500: "#3b6ef6",
          600: "#1a56db",  // primary
          700: "#1245b5",
          800: "#1539910",
          900: "#162d6b",
        },
      },
      boxShadow: {
        "sm-ring": "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
        "card":    "0 4px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.05)",
        "modal":   "0 16px 40px rgba(0,0,0,.10), 0 4px 12px rgba(0,0,0,.06)",
      },
      borderRadius: {
        "xl":  "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;