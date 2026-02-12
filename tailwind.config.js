/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        snap: {
          bg: "#0F1117",
          surface: "#1A1D27",
          "surface-hover": "#222633",
          card: "#1E2130",
          border: "#2A2E3F",
          "border-focus": "#4F8EF7",
          accent: "#4F8EF7",
          "accent-glow": "rgba(79, 142, 247, 0.15)",
          "accent-soft": "#3A6BC5",
          success: "#34D399",
          "success-bg": "rgba(52, 211, 153, 0.1)",
          warning: "#FBBF24",
          "warning-bg": "rgba(251, 191, 36, 0.1)",
          danger: "#F87171",
          "danger-bg": "rgba(248, 113, 113, 0.1)",
          text: "#E8ECF4",
          "text-muted": "#8B92A8",
          "text-dim": "#5A6178",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
