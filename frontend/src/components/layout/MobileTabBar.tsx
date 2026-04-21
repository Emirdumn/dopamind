"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GitCompare, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTabBarProps {
  messages: Record<string, string>;
}

/**
 * Mobile bottom tab bar.
 *
 * - Visible only on <768px (hidden md:block inverse)
 * - Fixed to viewport bottom, Canvas white, 1px Hairline top border
 * - Three-tab native-app rhythm: Home · Compare · Garage
 * - Active tab switches icon stroke + label colour to Rausch and
 *   draws a 2px Rausch pill indicator above the icon
 * - Safe-area inset handled via `pb-[env(safe-area-inset-bottom)]`
 *
 * The locale switcher and secondary actions remain in the top Header;
 * this bar is dedicated to primary page navigation.
 */
export default function MobileTabBar({ messages }: MobileTabBarProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";

  const items = [
    { href: "",        label: messages.home,        Icon: Home },
    { href: "/compare", label: messages.navCompare, Icon: GitCompare },
    { href: "/garage",  label: messages.navGarage,  Icon: Car },
  ];

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    if (href === "") return pathname === `/${locale}` || pathname === `/${locale}/`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  return (
    <nav
      aria-label="Primary mobile"
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50",
        "bg-canvas border-t border-hairline",
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="grid grid-cols-3">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex">
              <Link
                href={`/${locale}${href}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-2.5 h-16",
                  "font-sans text-[12px] font-medium transition-colors",
                  active ? "text-rausch" : "text-ash",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-[2px] w-6 -mt-1 rounded-full transition-opacity",
                    active ? "bg-rausch opacity-100" : "opacity-0",
                  )}
                />
                <Icon
                  className="w-5 h-5"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
