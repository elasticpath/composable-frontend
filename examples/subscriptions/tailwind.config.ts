import plugin from "tailwindcss/plugin";
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        "base-max-width": "80rem",
      },
      flex: {
        "only-grow": "1 0 0%",
      },
      colors: {
        brand: {
          primary: "#2BCC7E",
          secondary: "#144E31",
          highlight: "#56DC9B",
          primaryAlt: "#EA7317",
          secondaryAlt: "#ffcb47",
          gray: "#666666",
        },
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        blink: {
          "0%": { opacity: "0.2" },
          "20%": { opacity: "1" },
          "100% ": { opacity: "0.2" },
        },
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
        fadeIn: "fadeIn .3s ease-in-out",
        carousel: "marquee 60s linear infinite",
        blink: "blink 1.4s both infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      clipPath: {
        sidebar: "polygon(0 0, 100vmax 0, 100vmax 100%, 0 100%)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    require("tailwind-clip-path"),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "animation-delay": (value) => {
            return {
              "animation-delay": value,
            };
          },
        },
        {
          values: theme("transitionDelay"),
        },
      );
    }),
  ],
} satisfies Config;
