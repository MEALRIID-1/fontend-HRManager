import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        surface: {
          DEFAULT: "#ffffff",
          50:  "#f8faff",
          100: "#f0f4ff",
          200: "#e8eeff",
        },
        navy: {
          DEFAULT: "#0f2d5e",
          light: "#1a3f7a",
          dark: "#081e42",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#d1fae5",
          dark: "#065f46",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
          dark: "#92400e",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
          dark: "#991b1b",
        },
        muted: {
          DEFAULT: "#64748b",
          light: "#f1f5f9",
          dark: "#334155",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Geist", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-plus-jakarta)", "'Plus Jakarta Sans'", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)",
        "card-md": "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)",
        "card-lg": "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08)",
        blue: "0 4px 14px 0 rgba(37,99,235,0.25)",
        "blue-lg": "0 10px 30px 0 rgba(37,99,235,0.30)",
        "inner-blue": "inset 0 2px 4px 0 rgba(37,99,235,0.1)",
      },
      backgroundImage: {
        "gradient-blue": "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        "gradient-navy": "linear-gradient(135deg, #0f2d5e 0%, #1d4ed8 100%)",
        "gradient-surface": "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)",
        "mesh-blue": "radial-gradient(at 40% 20%, hsla(217,100%,60%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(220,100%,50%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(210,100%,55%,0.08) 0px, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s infinite",
        "modal-in": "modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "modal-backdrop-in": "modalBackdropIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        modalIn: {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        modalBackdropIn: {
          "0%": { opacity: "0", backdropFilter: "blur(0px)" },
          "100%": { opacity: "1", backdropFilter: "blur(12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
