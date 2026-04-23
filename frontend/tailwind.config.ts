import type { Config } from "tailwindcss";

/**
 * ArabaIQ — "Midnight Showroom" design system
 * --------------------------------------------
 * Material Design 3 token vocabulary on a deep blue-black void. The
 * spotlight lands on the subject through **tonal depth** (surface
 * container ladder) and **signature primary** (electric indigo LED
 * gradient), never through 1px dividers.
 *
 * ## Surface ladder (dimmest → brightest)
 *   surface-dim               #050914   image dim overlays
 *   surface-container-lowest  #070d1f   recessed backgrounds
 *   surface                   #0c1324   main canvas
 *   surface-container-low     #10182b   subtle card fill
 *   surface-container         #161e32   default card
 *   surface-container-high    #23293c   floating / hover target
 *   surface-container-highest #2e3447   modals, most prominent
 *   surface-variant           #1f2539   chip fills + glassmorphism base
 *
 * ## No-line rule
 *   Solid 1px borders for sectioning are forbidden. Separate blocks via
 *   surface-ladder shifts. `outline-variant` (#434758) exists only as a
 *   "ghost border" applied at 15-20% opacity where accessibility demands
 *   a visible edge (inputs, focus rings).
 *
 * ## Legacy token repoint
 *   Every token name shipped in Phases 1-4 (canvas, subsurface, hairline,
 *   ink, ash, mute, stone, rausch, ...) is preserved and repointed to
 *   Midnight Showroom equivalents so the ~300 existing Tailwind utility
 *   references continue to render sensibly with zero code churn.
 *
 *     canvas      → MD3 surface             (#0c1324)
 *     subsurface  → MD3 surface-container   (#161e32)
 *     hairline    → outline-variant         (#434758)
 *     ink         → on-surface              (#dce1fb)
 *     charcoal    → on-surface (slightly dim)
 *     ash         → on-surface-variant      (#9298b0)
 *     mute        → outline                 (#6a6f87)
 *     stone       → outline-variant         (#434758)
 *     rausch      → MD3 primary             (#c0c1ff)
 *     rausch.deep → MD3 primary-container   (#8083ff)
 *     error.*     → MD3 error palette
 *     info        → tertiary indigo         (#ddbbff)
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
        // ── Legacy semantic names, repointed to Midnight Showroom ──
        background: "#0c1324", // Surface (main canvas)
        surface:    "#161e32", // Surface-container (card default — kept as card semantic for legacy)
        foreground: "#dce1fb", // On-surface (NOT pure white per no-vibration rule)
        muted:      "#9298b0", // On-surface-variant
        accent:     "#434758", // Outline-variant (Ghost Border substrate)

        primary: {
          DEFAULT: "#c0c1ff", // MD3 primary — indigo, used for text, icons, gradient start
          container: "#8083ff", // MD3 primary-container — gradient end
          dim:       "#8083ff", // legacy alias (pressed/active) — points to container
          on:        "#ffffff", // MD3 on-primary — doc-explicit override (white text on gradient)
          "on-container": "#e0e0ff", // MD3 on-primary-container
        },

        // ── Canonical Midnight Showroom tokens ──
        canvas:     "#0c1324", // main page background (MD3 surface)
        subsurface: "#161e32", // card/panel default (MD3 surface-container)
        hairline:   "#434758", // outline-variant value — never solid, apply at opacity

        ink:        "#dce1fb", // primary text (on-surface, soft lavender-white)
        charcoal:   "#c4c8dd", // slightly dimmer, for extended copy
        ash:        "#9298b0", // secondary labels (on-surface-variant)
        mute:       "#6a6f87", // disabled / helper copy (outline)
        stone:      "#434758", // tertiary dividers when absolutely required (outline-variant)

        // ── MD3 canonical surface ladder ──
        "surface-dim":               "#050914",
        "surface-bright":            "#3a4057",
        "surface-variant":           "#1f2539",
        "surface-container-lowest":  "#070d1f",
        "surface-container-low":     "#10182b",
        "surface-container":         "#161e32",
        "surface-container-high":    "#23293c",
        "surface-container-highest": "#2e3447",

        // ── On-surface semantics ──
        "on-surface":         "#dce1fb",
        "on-surface-variant": "#c4c6d0",

        // ── Outlines ──
        outline:            "#8d92a9",
        "outline-variant":  "#434758",

        // ── Secondary (chips, filter surfaces) ──
        secondary: {
          DEFAULT:         "#bec6dc",
          container:       "#3a4253",
          "on-container":  "#dae2f9",
        },

        // ── Tertiary (optional accent for non-primary highlights) ──
        tertiary: {
          DEFAULT:         "#ddbbff",
          container:       "#4f378b",
          "on-container":  "#eaddff",
        },

        // ── Error (MD3 dark palette) ──
        error: {
          DEFAULT:         "#ffb4ab",
          container:       "#93000a",
          "on-container":  "#ffdad6",
          deep:            "#93000a", // legacy alias → container
        },

        // ── Legacy "rausch" alias — repointed to primary gradient ──
        rausch: {
          DEFAULT: "#c0c1ff", // was #ff385c Rausch red; now MD3 primary indigo
          deep:    "#8083ff", // was #e00b41 Rausch deep; now primary-container
        },

        // ── Info — points to tertiary indigo for parity with primary ──
        info: "#ddbbff",

        // ── Score palette — semantic exception (data visualisation) ──
        // Intentionally untouched across theme swaps: a user reading a
        // compare card should not have to relearn the green/amber/red
        // contract when the chrome changes.
        score: {
          hi:  "#22C55E",
          mid: "#F59E0B",
          lo:  "#EF4444",
        },

        // ── Legacy badge text tokens (kept as repointed aliases to
        //    avoid build-time misses; new badges use secondary-container) ──
        "badge-success": "#86efac",
        "badge-warning": "#fde68a",
      },

      fontFamily: {
        // Body & UI chrome — Inter (technical, legible)
        sans: ["var(--font-inter)", "Inter", "-apple-system", "system-ui", "Roboto", "Helvetica Neue", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "-apple-system", "system-ui", "Roboto", "Helvetica Neue", "sans-serif"],

        // Display & headlines — Plus Jakarta Sans (editorial, geometric)
        heading: ["var(--font-jakarta)", "Plus Jakarta Sans", "-apple-system", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "Plus Jakarta Sans", "-apple-system", "system-ui", "sans-serif"],
      },

      fontWeight: {
        body: "500",
      },

      letterSpacing: {
        "display-sm": "-0.015em",
        "display-md": "-0.02em",
        "display-lg": "-0.028em",
      },

      fontSize: {
        // Editorial scale — extreme contrast between display-lg and body-md
        // feeds the magazine-style hierarchy called for in the doc.
        "display-lg": ["clamp(3rem, 4.5vw, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.028em" }],
        "display-md": ["clamp(2.25rem, 3.5vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.75rem, 2.5vw, 2.25rem)", { lineHeight: "1.1",  letterSpacing: "-0.015em" }],
      },

      borderRadius: {
        none: "0",
        sm:   "4px",
        md:   "8px",
        lg:   "12px", // MD3 xl — primary CTA radius (doc §5)
        xl:   "20px", // larger cards, hero containers
        "2xl": "32px",
        full: "9999px",
        DEFAULT: "8px",
      },

      boxShadow: {
        // ── Ambient (Midnight Showroom spec §4) ──
        //   40-60px blur @ 4-8% opacity, tinted with surface-container-lowest.
        //   Never pure black. Always diffused.
        none:  "none",
        pop:   "0 8px 24px 0 rgba(7, 13, 31, 0.05)",
        press: "0 12px 32px 0 rgba(7, 13, 31, 0.06)",
        lift:
          "0 4px 12px 0 rgba(7, 13, 31, 0.05), " +
          "0 24px 60px 0 rgba(7, 13, 31, 0.08)",
        ambient:
          "0 16px 48px 0 rgba(7, 13, 31, 0.06), " +
          "0 4px 12px 0 rgba(7, 13, 31, 0.05)",

        // ── Focus (2px primary border, no offset) ──
        focus:         "0 0 0 2px #c0c1ff",
        "focus-white": "0 0 0 2px #c0c1ff", // legacy alias

        // ── Primary glow (hover on Showroom cards — light bleed simulation) ──
        glow: "0 0 0 1px rgba(192, 193, 255, 0.22), 0 8px 32px 0 rgba(128, 131, 255, 0.12)",
      },

      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #c0c1ff 0%, #8083ff 100%)",
        "gradient-primary-horizontal": "linear-gradient(90deg, #c0c1ff 0%, #8083ff 100%)",
        "gradient-wordmark": "linear-gradient(90deg, #c0c1ff 0%, #8083ff 100%)",
        "light-bleed":
          "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(192, 193, 255, 0.08) 0%, transparent 70%)",
      },

      backdropBlur: {
        glass: "20px", // Midnight Showroom glassmorphism — 20px per doc §2
      },

      transitionDuration: {
        DEFAULT: "300ms", // premium feel minimum per doc §6
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
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
