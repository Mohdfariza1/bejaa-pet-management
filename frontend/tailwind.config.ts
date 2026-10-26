import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Light and warm for the front desk. Red / amber / green are kept for meaning only.
      colors: {
        page: "#FAF7F2",
        card: "#FFFFFF",
        soft: "#F3EFE8",
        line: "#E7E2D9",
        ink: "#1F2937",
        muted: "#6B7280",
        brand: { DEFAULT: "#0F766E", dark: "#115E59", soft: "#E6F2F0" },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
