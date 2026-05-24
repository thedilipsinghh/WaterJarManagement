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
    },
  },
  plugins: [],
}
