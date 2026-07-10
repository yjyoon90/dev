import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 모던 인디고 테마 (포인트 #6366F1)
        brand: {
          50: "#EEF0FE",
          100: "#E0E3FD",
          300: "#A5B0F8",
          400: "#818CF8",
          500: "#6D78F5",
          600: "#6366F1",
          700: "#4F46E5",
        },
      },
    },
  },
  plugins: [],
};

export default config;
