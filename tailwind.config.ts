import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#15130F",
        paper: "#FFFFFF",
        cloud: "#FAF8F5",
        line: "#E7E2DA",
        flare: {
          50: "#FFF6EC",
          100: "#FFE8CE",
          300: "#FDB463",
          500: "#F97316",
          600: "#EA5B0C",
          700: "#C2410C",
          900: "#7C2D0E",
        },
        muted: "#6B6459",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: {
        wrap: "1240px",
      },
      backgroundImage: {
        "flare-gradient": "linear-gradient(135deg, #F97316 0%, #FDB463 55%, #FFD9A8 100%)",
        "ink-gradient": "linear-gradient(135deg, #201C15 0%, #0F0D0A 100%)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21,19,15,0.04), 0 12px 32px -16px rgba(21,19,15,0.18)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.16,1,0.3,1) both",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
