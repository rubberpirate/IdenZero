import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xs': '475px',
      },
      borderWidth: {
        'thin': '0.5px',
        'ultra-thin': '0.25px',
      },
      colors: {
        border: "hsl(0 0% 15%)", // Even darker border
        input: "hsl(0 0% 20%)", // Even darker input
        ring: "hsl(0 0% 25%)", // Even darker ring
        background: "hsl(0 0% 4%)", // Much darker background
        foreground: "hsl(0 0% 95%)", // Light foreground for contrast
        primary: {
          DEFAULT: "oklch(62.7% 0.194 149.214)", // Green theme color
          foreground: "hsl(0 0% 95%)",
        },
        secondary: {
          DEFAULT: "hsl(0 0% 10%)", // Much darker secondary
          foreground: "hsl(0 0% 95%)",
        },
        success: {
          DEFAULT: "oklch(55% 0.18 149.214)", // Slightly darker green for success
          foreground: "hsl(0 0% 95%)",
        },
        warning: {
          DEFAULT: "hsl(40 70% 50%)", // Muted warning
          foreground: "hsl(0 0% 5%)",
        },
        muted: {
          DEFAULT: "hsl(0 0% 30%)", // Darker muted
          foreground: "hsl(0 0% 70%)",
        },
        accent: {
          DEFAULT: "oklch(62.7% 0.194 149.214)", // Green accent to match primary
          foreground: "hsl(0 0% 95%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 9%)", // Dark popover background
          foreground: "hsl(0 0% 95%)", // Light text for popover
        },
        card: {
          DEFAULT: "hsl(0 0% 8%)", // Dark card background
          foreground: "hsl(0 0% 95%)", // Light text for card
        },
      },
      backgroundImage: {
        "grid-pattern": `url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 800%22%3E%3Cg stroke-width=%223.5%22 stroke=%22hsla(0, 0%25, 100%25, 1.00)%22 fill=%22none%22%3E%3Crect width=%22400%22 height=%22400%22 x=%220%22 y=%220%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%220%22 cy=%220%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22400%22 y=%220%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22400%22 cy=%220%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22800%22 y=%220%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22800%22 cy=%220%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%220%22 y=%22400%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%220%22 cy=%22400%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22400%22 y=%22400%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22400%22 cy=%22400%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22800%22 y=%22400%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22800%22 cy=%22400%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%220%22 y=%22800%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%220%22 cy=%22800%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22400%22 y=%22800%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22400%22 cy=%22800%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22800%22 y=%22800%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22800%22 cy=%22800%22 fill=%22hsla(0, 0%25, 100%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3C/g%3E%3C/svg%3E")`,
        "grid-pattern-light": `url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 800%22%3E%3Cg stroke-width=%223.5%22 stroke=%22hsla(215, 16%25, 47%25, 1.00)%22 fill=%22none%22%3E%3Crect width=%22400%22 height=%22400%22 x=%220%22 y=%220%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%220%22 cy=%220%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22400%22 y=%220%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22400%22 cy=%220%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22800%22 y=%220%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22800%22 cy=%220%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%220%22 y=%22400%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%220%22 cy=%22400%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22400%22 y=%22400%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22400%22 cy=%22400%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22800%22 y=%22400%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22800%22 cy=%22400%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%220%22 y=%22800%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%220%22 cy=%22800%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22400%22 y=%22800%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22400%22 cy=%22800%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3Crect width=%22400%22 height=%22400%22 x=%22800%22 y=%22800%22 opacity=%220.15%22%3E%3C/rect%3E%3Ccircle r=%2210.85%22 cx=%22800%22 cy=%22800%22 fill=%22hsla(215, 16%25, 47%25, 1.00)%22 stroke=%22none%22%3E%3C/circle%3E%3C/g%3E%3C/svg%3E")`,
      },
      borderRadius: { // Slightly less rounded for a sleeker look
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      // Removing animations for a more minimalistic feel
      // animation: {
      //   "fade-in": "fade-in 0.5s ease-out",
      //   "slide-up": "slide-up 0.5s ease-out",
      // },
      // keyframes: {
      //   "fade-in": {
      //     "0%": { opacity: "0" },
      //     "100%": { opacity: "1" },
      //   },
      //   "slide-up": {
      //     "0%": { transform: "translateY(10px)", opacity: "0" },
      //     "100%": { transform: "translateY(0)", opacity: "1" },
      //   },
      // },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;