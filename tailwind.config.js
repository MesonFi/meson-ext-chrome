// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx,js,jsx,html}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        xs: ['12px', '18px'], // font-size: 12px, line-height: 18px
      },
      colors: {
        white: "#FFFFFF",
        black: "#000000",
        primary: "#25C696",
        "primary-hover": "#1BE2BB",
        secondary: "#6F9483",
        "color-strong": "#25372E",
        "color-regular": "#75807B",
        "color-muted": "#BDC7C3",
        border: "#DDF3EA",
        surface: "#F2F9F7",
        disabled: "#DFEBE7",
        success: "#11C58F",
        warning: "#FFC700",
        error: "#FD5050",
      },
      borderColor: {
        DEFAULT: "#DDF3EA",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
