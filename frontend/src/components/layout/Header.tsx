"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
];

interface HeaderProps {
  messages: Record<string, string>;
}

/**
 * Midnight Showroom top navigation.
 *
 * Desktop (≥768px):
 *   [Araba|IQ wordmark]   Home · Recommendations · Compare · Garage   TR / EN
 *   - Height 80px, **glassmorphism** (surface-variant @ 40% + 20px blur)
 *   - No border-bottom — separation emerges from the canvas underneath
 *     flowing past the glass panel (doc §2 "no-line rule")
 *   - Wordmark: "Araba" in on-surface + "IQ" in primary gradient
 *     (Jakarta 700, tight tracking)
 *   - Active nav link: primary label + 2px primary pill indicator
 *
 * Mobile (<768px):
 *   [Araba|IQ wordmark]                                               TR / EN
 *   - Height 64px, no centre nav; page nav lives in `MobileTabBar`
 *   - Edge padding tightens to 16px per the responsive rhythm
 */
export default function Header({ messages }: HeaderProps) {
  const params   = useParams();
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = (params?.locale as string) || "tr";

  const navItems = [
    { href: "",                   label: messages.home },
    { href: "/recommendations",   label: messages.navRecommendations },
    { href: "/compare",           label: messages.navCompare },
    { href: "/garage",            label: messages.navGarage },
  ];

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    if (href === "") return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const switchLang = (code: string) => {
    router.push(pathname.replace(`/${locale}`, `/${code}`));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-[1760px] mx-auto px-4 md:px-10 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Wordmark — split lockup */}
        <Link
          href={`/${locale}`}
          aria-label={messages.brand}
          className="font-heading font-bold text-[22px] md:text-[26px] tracking-[-0.028em] flex items-baseline"
        >
          <span className="text-on-surface">Araba</span>
          <span className="brand-gradient">IQ</span>
        </Link>

        {/* Desktop nav — generous pill targets per doc §6 "Don't crowd navigation" */}
        <nav className="hidden md:flex items-center gap-2" aria-label="Primary">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={cn(
                  "relative px-6 py-3 font-sans text-[16px] font-semibold rounded-full transition-colors duration-300",
                  active ? "text-primary" : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-1 h-[2px] w-8 rounded-full primary-gradient-horizontal transition-opacity duration-300",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Locale switcher */}
        <div className="flex items-center gap-1">
          {LOCALES.map((l, i) => (
            <span key={l.code} className="flex items-center">
              <button
                type="button"
                onClick={() => switchLang(l.code)}
                aria-pressed={locale === l.code}
                className={cn(
                  "font-sans text-[15px] font-semibold px-3 py-1.5 rounded-md transition-colors duration-300",
                  locale === l.code
                    ? "text-on-surface"
                    : "text-on-surface-variant/70 hover:text-on-surface",
                )}
              >
                {l.label}
              </button>
              {i < LOCALES.length - 1 && (
                <span aria-hidden="true" className="text-outline-variant">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
