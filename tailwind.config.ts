import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        default: ['var(--font-sora)'],
      },
      colors: {
        "azul": "#00A3FF",
        "grey": "#C7C7C7",
        "cblack": "#0F0F0F"
      }

    },
  },
  plugins: [],
};
export default config;
