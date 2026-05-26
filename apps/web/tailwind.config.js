/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(229, 231, 235)",
        input: "rgb(229, 231, 235)",
        background: "rgb(255, 255, 255)",
        foreground: "rgb(15, 23, 42)",
        primary: {
          DEFAULT: "rgb(15, 23, 42)",
          foreground: "rgb(255, 255, 255)",
        },
        secondary: {
          DEFAULT: "rgb(241, 245, 249)",
          foreground: "rgb(15, 23, 42)",
        },
        destructive: {
          DEFAULT: "rgb(239, 68, 68)",
          foreground: "rgb(255, 255, 255)",
        },
        muted: {
          DEFAULT: "rgb(241, 245, 249)",
          foreground: "rgb(100, 116, 139)",
        },
        accent: {
          DEFAULT: "rgb(241, 245, 249)",
          foreground: "rgb(15, 23, 42)",
        },
        card: {
          DEFAULT: "rgb(255, 255, 255)",
          foreground: "rgb(15, 23, 42)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "content-show": {
          from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "overlay-show": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "content-show": "content-show 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "overlay-show": "overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
}
