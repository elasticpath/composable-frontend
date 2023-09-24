import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        "base-max-width": "80rem",
      },
      colors: {
        brand: {
          primary: "#0033CC",
          secondary: "#091740",
          highlight: "#1E40AF",
          primaryAlt: "#EA7317",
          secondaryAlt: "#ffcb47",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
