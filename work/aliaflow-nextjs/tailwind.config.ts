import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/admin/**/*.{ts,tsx}",
    "./components/admin/**/*.{ts,tsx}",
    "./components/ui/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
