import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
      },
      colors: {
        border: "transparent",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFFFF",
        foreground: "#000000",
        miiles: {
          blue: "#4059F1",
          "blue-light": "#E8ECFE",
          pink: "#FCB5B9",
          "pink-light": "#FEEDED",
          gray: {
            50: "#F7F7F8",
            100: "#EEEFF2",
            200: "#D9DBE3",
            400: "#9499AE",
            600: "#4B4F63",
            800: "#1C1E2A",
          }
        },
        primary: {
          DEFAULT: "#000000",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#FEEDED",
          foreground: "#FCB5B9",
        },
        muted: {
          DEFAULT: "#F7F7F8",
          foreground: "#9499AE",
        },
        accent: {
          DEFAULT: "#4059F1",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        sidebar: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
          primary: "#000000",
          "primary-foreground": "#FFFFFF",
          accent: "#F7F7F8",
          "accent-foreground": "#000000",
          border: "transparent",
          ring: "#4059F1",
        },
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        full: "9999px",
      },
      boxShadow: {
        sm: "8px 6px 30px 0px rgba(24, 2, 56, 0.03)",
        md: "0px 100px 170px 0px rgba(39, 39, 62, 0.05)",
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
} satisfies Config;
