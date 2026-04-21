import type { Config } from "tailwindcss";

/**
 * ArabaIQ — Airbnb-inspired light design system
 * ---------------------------------------------
 * Token names mirror Airbnb's published CSS variables where possible
 * (Rausch, Ink, Ash, Hairline...) and keep legacy semantic names
 * (background, foreground, surface, muted, accent, primary) repointed
 * to Airbnb palette values so existing Tailwind utility classes
 * continue to render sensibly during the component migration.
 *
 * Product-tier accents (Plus Magenta #92174d, Luxe Purple #460479)
 * are intentionally NOT added here — reserved for a future premium
 * surface. See tasks/todo.md.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Legacy semantic names, repointed to Airbnb light palette ──
        background: "#ffffff", // Canvas White
        surface:    "#f7f7f7", // Soft Cloud (subsurface)
        foreground: "#222222", // Ink Black
        muted:      "#6a6a6a", // Ash Gray
        accent:     "#dddddd", // Hairline Gray (1px divider workhorse)

        primary: {
          DEFAULT: "#ff385c", // Rausch — brand accent
          dim:     "#e00b41", // Deep Rausch — pressed/active state
        },

        // ── Airbnb-named tokens for new Phase 2+ code ──
        canvas:     "#ffffff",
        subsurface: "#f7f7f7",
        hairline:   "#dddddd",

        ink:        "#222222", // near-black, 90% of text
        charcoal:   "#3f3f3f", // focused input text
        ash:        "#6a6a6a", // secondary labels
        mute:       "#929292", // disabled / low-priority
        stone:      "#c1c1c1", // tertiary dividers, icon strokes

        rausch: {
          DEFAULT: "#ff385c",
          deep:    "#e00b41",
        },

        // ── Semantic (validation + links) ──
        error: {
          DEFAULT: "#c13515",
          deep:    "#b32505",
        },
        info: "#428bff", // legal / informational links only

        // ── Score palette — semantic exception (Do's/Don'ts §7) ──
        // Kept for ScoreRing; users must parse numeric health at a glance.
        score: {
          hi:  "#22C55E",
          mid: "#F59E0B",
          lo:  "#EF4444",
        },
      },

      fontFamily: {
        // Single-family system, Inter as the open-source Cereal VF substitute.
        // `--font-inter` is injected by next/font in app/layout.tsx (Phase 3).
        sans:    ["var(--font-inter)", "Inter", "-apple-system", "system-ui", "Roboto", "Helvetica Neue", "sans-serif"],
        heading: ["var(--font-inter)", "Inter", "-apple-system", "system-ui", "Roboto", "Helvetica Neue", "sans-serif"],
        body:    ["var(--font-inter)", "Inter", "-apple-system", "system-ui", "Roboto", "Helvetica Neue", "sans-serif"],
      },

      fontWeight: {
        // System body weight is 500 (not 400) — gives every paragraph
        // a confident extra density. See typography §3.
        body: "500",
      },

      letterSpacing: {
        // Display type tightens, body stays at 0.
        "display-sm": "-0.01em",   // 16–20px headlines
        "display-md": "-0.018em",  // 20–28px section headings
        "display-lg": "-0.02em",   // 28px+ page titles
      },

      borderRadius: {
        // Airbnb radius scale — see layout §5
        none: "0",
        sm:   "4px",   // inline anchors, tag chips
        md:   "8px",   // text buttons, dropdowns
        lg:   "14px",  // listing cards, containers, badges
        xl:   "20px",  // pill buttons, booking panel, large images
        "2xl": "32px", // search pill, extra-large containers
        full: "9999px",
        DEFAULT: "8px", // default button / input radius
      },

      boxShadow: {
        // Airbnb uses stacked layered shadows; a single drop shadow is
        // never used on cards. Listing cards have no elevation at all.
        none:  "none",
        pop:   "rgba(0, 0, 0, 0.04) 0 2px 6px 0",
        press: "rgba(0, 0, 0, 0.08) 0 4px 12px",
        lift:  "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0",
        focus: "0 0 0 2px #222222",
        "focus-white": "0 0 0 4px rgb(255, 255, 255)",
      },

      animation: {
        "fade-in":  "fadeIn 0.4s ease-out forwards",
        "fade-up":  "fadeUp 0.5s ease-out forwards",
        "shimmer":  "shimmer 2.2s linear infinite",
        "press":    "press 120ms ease-out",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        press: {
          "0%":   { transform: "scale(1)" },
          "50%":  { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
