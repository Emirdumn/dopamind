import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArabaIQ",
  description: "Car recommendations and comparison platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col bg-[#E0E7D7] text-[#2d3a2a] antialiased">
        {children}
      </body>
    </html>
  );
}
