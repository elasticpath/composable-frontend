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
          primary: "#2BCC7E",
          secondary: "#144E31",
          highlight: "#56DC9B",
          primaryAlt: "#EA7317",
          secondaryAlt: "#ffcb47",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
