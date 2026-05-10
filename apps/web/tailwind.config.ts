import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#f5f1eb",
          50: "#faf8f5",
          100: "#f5f1eb",
          200: "#ebe4d8",
          300: "#e0d5c5",
          400: "#d4c4ad",
        },
        kraft: {
          DEFAULT: "#c4a882",
          light: "#d4bd9c",
          dark: "#a8895e",
        },
        coral: {
          DEFAULT: "#c96b55",
          light: "#d88a78",
          dark: "#a85540",
          50: "#fdf0ed",
          100: "#f9d9d1",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          light: "#2d2d2d",
          muted: "#6b6358",
          faint: "#9a9084",
          ghost: "#b8afa4",
        },
        surface: {
          DEFAULT: "#f5f1eb",
          white: "#ffffff",
          warm: "#faf8f5",
          card: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["DM Sans", "system-ui", "sans-serif"],
        script: ["Playfair Display", "Georgia", "serif"],
      },
      borderColor: {
        DEFAULT: "#e0d5c5",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
