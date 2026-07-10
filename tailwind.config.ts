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
        // 따뜻한 오렌지 테마 (포인트 #FF7E36)
        brand: {
          50: "#FFF4EC",
          100: "#FFE4D1",
          300: "#FFB27A",
          400: "#FFA766",
          500: "#FF8F4D",
          600: "#FF7E36",
          700: "#E9631E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
