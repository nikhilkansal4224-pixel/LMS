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
        obsidian: {
          base: "#161920",
          surface: "#1B1F28",
          surfaceElevated: "#212632",
          surfaceLight: "#262C3A",
          border: "rgba(255, 255, 255, 0.05)",
          borderGlow: "rgba(245, 158, 11, 0.25)",
        },
        amber: {
          gold: "#F59E0B",
          glow: "#FBBF24",
          deep: "#D97706",
          light: "#FEF3C7",
        },
        status: {
          safe: "#34D399",
          warning: "#FBBF24",
          critical: "#F87171",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        // Raised Neumorphic surfaces
        "neu-raised": "-8px -8px 18px rgba(255, 255, 255, 0.04), 10px 10px 22px rgba(8, 10, 14, 0.75)",
        "neu-raised-sm": "-4px -4px 10px rgba(255, 255, 255, 0.04), 5px 5px 12px rgba(8, 10, 14, 0.65)",
        "neu-raised-hover": "-10px -10px 22px rgba(255, 255, 255, 0.05), 14px 14px 28px rgba(8, 10, 14, 0.85)",
        
        // Deeply Inset wells & pressed tracks
        "neu-pressed": "inset 5px 5px 10px rgba(7, 9, 13, 0.85), inset -4px -4px 8px rgba(255, 255, 255, 0.035)",
        "neu-pressed-sm": "inset 3px 3px 6px rgba(6, 8, 12, 0.8), inset -2px -2px 5px rgba(255, 255, 255, 0.03)",
        "neu-pressed-track": "inset 4px 4px 8px rgba(5, 7, 10, 0.9), inset -2px -2px 5px rgba(255, 255, 255, 0.025)",
        
        // Amber Glow Accents
        "neu-glow-amber": "0 0 24px rgba(245, 158, 11, 0.35), 0 0 45px rgba(245, 158, 11, 0.15)",
        "neu-glow-emerald": "0 0 24px rgba(52, 211, 153, 0.35), 0 0 45px rgba(52, 211, 153, 0.15)",
        "neu-glow-coral": "0 0 24px rgba(248, 113, 113, 0.35), 0 0 45px rgba(248, 113, 113, 0.15)",
      },
      borderRadius: {
        "bento": "26px",
      },
    },
  },
  plugins: [],
};
export default config;
