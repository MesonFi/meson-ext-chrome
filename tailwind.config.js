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
        // border: "hsl(var(--border))",
        // input: "hsl(var(--input))",
        // ring: "hsl(var(--ring))",
        // background: "hsl(var(--background))",
        // foreground: "hsl(var(--foreground))",
        // primary: {
        //   DEFAULT: "hsl(var(--primary))",
        //   foreground: "hsl(var(--primary-foreground))",
        // },
        // secondary: {
        //   DEFAULT: "hsl(var(--secondary))",
        //   foreground: "hsl(var(--secondary-foreground))",
        // },
        // destructive: {
        //   DEFAULT: "hsl(var(--destructive))",
        //   foreground: "hsl(var(--destructive-foreground))",
        // },
        // muted: {
        //   DEFAULT: "hsl(var(--muted))",
        //   foreground: "hsl(var(--muted-foreground))",
        // },
        // accent: {
        //   DEFAULT: "hsl(var(--accent))",
        //   foreground: "hsl(var(--accent-foreground))",
        // },
        // popover: {
        //   DEFAULT: "hsl(var(--popover))",
        //   foreground: "hsl(var(--popover-foreground))",
        // },
        // card: {
        //   DEFAULT: "hsl(var(--card))",
        //   foreground: "hsl(var(--card-foreground))",
        // },
        // Custom colors for Button component
        primaryColor: "#25C696",
        primaryColorHover: "#1BE2BB",
        primaryColorLinear: "var(--primary-color-linear)",
        primaryColorLinearHover: "var(--primary-color-linear-hover)",
        primaryColorLinearActive: "var(--primary-color-linear-active)",
        secondaryBg: "hsl(var(--secondary-bg))",
        textColor1: "#25372E",
        textColor2: "#6F9483",
        textColor3: "#BDC7C3",
        textColor4: "#75807B",
        disableColor: "#DFEBE7",
        borderColor: "#DDF3EA",
        active: "#11C58F",
        warning: '#FFC700',
        error: '#FD5050',
        errorHover: "hsl(var(--error-hover))",
        errorActive: "hsl(var(--error-active))",
        card: "#F2F9F7",
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
