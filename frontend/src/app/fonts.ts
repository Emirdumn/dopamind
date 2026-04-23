import { Inter, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Midnight Showroom — dual-typeface system.
 *
 * - Plus Jakarta Sans (display / headlines): geometric, modern automotive
 *   branding feel. Drives `font-display` and `font-heading` utilities, and
 *   the `<h1>`–`<h3>` base stack. Used at tight letter-spacing for hero
 *   car names (`display-lg`).
 * - Inter (body / labels): technical spec legibility down to `label-sm`.
 *   Drives `font-sans` and `font-body` for all running copy, table cells,
 *   spec rows and UI chrome.
 *
 * CSS variables `--font-inter` and `--font-jakarta` are attached to the
 * `<html>` element in `app/[locale]/layout.tsx` and consumed by
 * `tailwind.config.ts` font stacks.
 */
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
