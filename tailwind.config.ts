import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial dark canvas
        ink: {
          900: "#0A0A0C",
          800: "#0E0E12",
          700: "#14141A",
          600: "#1C1C24",
          500: "#26262F",
          400: "#33333F",
          300: "#4A4A58",
          200: "#6E6E7E",
          100: "#9A9AA6",
          50: "#D6D6DC",
        },
        // Single vibrant accent — electric cyan
        accent: {
          DEFAULT: "#00E5FF",
          soft: "rgba(0, 229, 255, 0.16)",
          dim: "rgba(0, 229, 255, 0.08)",
          line: "rgba(0, 229, 255, 0.35)",
        },
        // Stark monochrome
        stark: {
          black: "#050506",
          white: "#FFFFFF",
          line: "#1C1C24",
        },
      },
      fontFamily: {
        // Bold grotesque sans for headings / UI
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        // Display — tighter, bolder tracking for masthead type
        display: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        // Mono for code / timestamps
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        // Aggressive editorial scale
        "2xl": ["1.5rem", { lineHeight: "1.05", fontWeight: "700" }],
        "3xl": ["2rem", { lineHeight: "1.0", fontWeight: "800" }],
        "4xl": ["2.75rem", { lineHeight: "0.95", fontWeight: "800" }],
        "5xl": ["3.75rem", { lineHeight: "0.92", fontWeight: "800" }],
        "6xl": ["5rem", { lineHeight: "0.9", fontWeight: "800" }],
      },
      spacing: {
        "safe-t": "env(safe-area-inset-top, 0px)",
        "safe-b": "env(safe-area-inset-bottom, 0px)",
        "safe-l": "env(safe-area-inset-left, 0px)",
        "safe-r": "env(safe-area-inset-right, 0px)",
      },
      borderWidth: {
        DEFAULT: "1px",
        2: "2px",
        3: "3px",
        4: "4px",
        6: "6px",
        8: "8px",
      },
      borderColor: {
        DEFAULT: "#1C1C24",
        stark: "#050506",
      },
      boxShadow: {
        // Hard offset shadow — no blur, editorial
        hard: "4px 4px 0px 0px #050506",
        "hard-accent": "4px 4px 0px 0px #00E5FF",
        "hard-lg": "6px 6px 0px 0px #050506",
        "hard-xl": "10px 10px 0px 0px #050506",
        // Pressed state: inset offset
        pressed: "inset 3px 3px 0px 0px #050506",
        "pressed-accent": "inset 3px 3px 0px 0px #00E5FF",
      },
      borderRadius: {
        // Stark, mostly sharp with slight rounding
        none: "0px",
        sm: "2px",
        md: "4px",
        lg: "8px",
        xl: "12px",
      },
      keyframes: {
        // Blinking caret for the editor
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        // Slide-up for bottom sheets
        slideUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        // Fade for overlays
        fade: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        // Pulse for recording indicator
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.75)" },
        },
      },
      animation: {
        blink: "blink 1.1s steps(2, start) infinite",
        slideUp: "slide-up 280ms cubic-bezier(0.22, 1, 0.36, 1)",
        fade: "fade 200ms ease-out",
        pulseDot: "pulseDot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
