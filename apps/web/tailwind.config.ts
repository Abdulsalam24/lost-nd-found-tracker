import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--color-bg, #0a0f0a)",
          card: "var(--color-bg-card, #141414)",
          elevated: "var(--color-bg-elevated, #161b16)",
          hover: "var(--color-bg-hover, #1c221c)",
        },
        grid: {
          DEFAULT: "#1a2e1a",
        },
        accent: {
          DEFAULT: "var(--color-accent, #3f8378)",
          light: "var(--color-accent-light, #33c48a)",
          dark: "#3f8378",
          muted: "#3f837840",
          glow: "#3f837820",
          brand: "#3f8378",
        },
        text: {
          DEFAULT: "var(--color-text, #f0fdf4)",
          secondary: "var(--color-text-secondary, #9ca3af)",
          muted: "var(--color-text-muted, #6b7280)",
          ghost: "var(--color-text-ghost, #4b5563)",
        },
        border: {
          DEFAULT: "var(--color-border, #1f2e1f)",
          light: "var(--color-border-light, #2a3d2a)",
          card: "var(--color-border-card, #1a2a1a)",
        },
        cream: {
          DEFAULT: "var(--color-bg, #0a0f0a)",
          50: "var(--color-bg-card, #141414)",
          100: "var(--color-bg-elevated, #161b16)",
          200: "var(--color-bg-hover, #1c221c)",
          300: "#1f2e1f",
          400: "#2a3d2a",
        },
        ink: {
          DEFAULT: "var(--color-text, #f0fdf4)",
          light: "#e2e8f0",
          muted: "var(--color-text-muted, #9ca3af)",
          faint: "#6b7280",
          ghost: "#4b5563",
        },
        coral: {
          DEFAULT: "var(--color-accent, #00a86b)",
          light: "var(--color-accent-light, #33c48a)",
          dark: "#3f8378",
          50: "#1a3733",
          100: "#2b5a53",
        },
        surface: {
          DEFAULT: "var(--color-bg, #0a0f0a)",
          white: "var(--color-bg-card, #141414)",
          warm: "var(--color-bg-elevated, #161b16)",
          card: "var(--color-bg-card, #141414)",
        },
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        heading: ["Sora", "system-ui", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "var(--color-border, #1f2e1f)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "scan-line": "scanLine 3s ease-in-out infinite",
        "nav-bounce": "navBounce 0.4s ease-out",
      },
      keyframes: {
        navBounce: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.25)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        scanLine: {
          "0%, 100%": { transform: "translateY(-50%)", opacity: "0.3" },
          "50%": { transform: "translateY(50%)", opacity: "0.8" },
        },
        radarPulse: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(8)", opacity: "0" },
        },
        heroFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gridDrift: {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "48px 48px, 48px 48px" },
        },
        gridDriftCoarse: {
          "0%": { backgroundPosition: "0 0, 0 0" },
          "100%": { backgroundPosition: "192px 192px, 192px 192px" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
