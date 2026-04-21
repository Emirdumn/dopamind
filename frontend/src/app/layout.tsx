import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArabaIQ",
  description: "Data-driven car recommendations and comparison.",
};

/**
 * Root layout is a pass-through so `<html lang>` can be set dynamically
 * in `app/[locale]/layout.tsx`, where the Inter font variable is also
 * applied.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return children as any;
}
