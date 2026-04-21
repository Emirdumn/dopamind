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
 * Top navigation.
 *
 * Desktop (≥768px):
 *   [ArabaIQ wordmark]   Home · Recommendations · Compare · Garage   TR / EN
 *   - Height 80px, white canvas, 1px Hairline bottom border
 *   - Wordmark rendered with the Rausch→magenta `.brand-gradient`
 *   - Active nav link gets a 2px Ink underline (4px below baseline)
 *
 * Mobile (<768px):
 *   [ArabaIQ wordmark]                                               TR / EN
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas border-b border-hairline">
      <div className="max-w-[1760px] mx-auto px-4 md:px-10 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link
          href={`/${locale}`}
          aria-label={messages.brand}
          className="brand-gradient font-sans font-bold text-[20px] md:text-[22px] tracking-[-0.02em]"
        >
          {messages.brand}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={cn(
                  "relative px-3 py-2 font-sans text-[14px] font-medium transition-colors",
                  active ? "text-ink" : "text-ash hover:text-ink",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-ink transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Locale switcher */}
        <div className="flex items-center gap-0.5">
          {LOCALES.map((l, i) => (
            <span key={l.code} className="flex items-center">
              <button
                type="button"
                onClick={() => switchLang(l.code)}
                aria-pressed={locale === l.code}
                className={cn(
                  "font-sans text-[14px] font-medium px-2 py-1 rounded-md transition-colors",
                  locale === l.code
                    ? "text-ink"
                    : "text-mute hover:text-ink",
                )}
              >
                {l.label}
              </button>
              {i < LOCALES.length - 1 && (
                <span aria-hidden="true" className="text-stone">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
