import { Inter } from "next/font/google";

/**
 * Inter — open-source substitute for Airbnb Cereal VF.
 *
 * The CSS variable `--font-inter` declared here is referenced by every
 * `font-sans` / `font-heading` / `font-body` utility in
 * `tailwind.config.ts`. Apply `inter.variable` to the `<html>` element
 * (done in `app/[locale]/layout.tsx`) to inject it.
 */
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
