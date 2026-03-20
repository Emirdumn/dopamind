"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, User, Globe, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";

const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "简体中文", flag: "🇨🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
];

interface HeaderProps {
  messages: Record<string, string>;
}

export default function Header({ messages }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";

  const { isAuthenticated, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const switchLang = (code: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${code}`);
    router.push(newPath);
    setLangOpen(false);
    setMenuOpen(false);
  };

  const navLinks = [
    { href: `/${locale}/assessment`, label: locale === "tr" ? "ADHD Test" : "ADHD Test", num: "01" },
    { href: `/${locale}/recommendations`, label: locale === "tr" ? "ArabaIQ · Öneri" : "ArabaIQ · Recommend", num: "02" },
    { href: `/${locale}/compare`, label: locale === "tr" ? "Karşılaştır" : "Compare", num: "03" },
    { href: `/${locale}/products`, label: messages.products, num: "04" },
    { href: `/${locale}/content`, label: messages.content, num: "05" },
    { href: `/${locale}/operations`, label: locale === "tr" ? "Operasyon" : "Operations", num: "06" },
    { href: `/${locale}/about`, label: messages.about, num: "07" },
  ];

  return (
    <>
      {/* Header bar - transparent */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#E0E7D7]/60 backdrop-blur-md border-b border-[#B7C396]/20">
        <div className="px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-3 text-[#2d3a2a] group"
            >
              <div className="flex flex-col gap-[5px]">
                <span className="block w-5 h-[1.5px] bg-[#2d3a2a] group-hover:w-6 transition-all duration-300" />
                <span className="block w-3 h-[1.5px] bg-[#2d3a2a] group-hover:w-6 transition-all duration-300" />
              </div>
              <span className="text-[13px] font-medium tracking-wide hidden sm:inline">
                Menu
              </span>
            </button>

            <Link href={`/${locale}`} className="absolute left-1/2 -translate-x-1/2">
              <span className="text-[18px] sm:text-[20px] font-bold text-[#2d3a2a] tracking-[0.15em] uppercase">
                Dopamind
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleCart}
                className="relative p-2 text-[#2d3a2a] hover:text-[#5a7a52] transition-colors"
              >
                <ShoppingCart className="w-[18px] h-[18px]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0 -right-0 w-4 h-4 bg-[#5a7a52] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
              <Link
                href={isAuthenticated ? `/${locale}/account` : `/${locale}/auth/login`}
                className="p-2 text-[#2d3a2a] hover:text-[#5a7a52] transition-colors"
              >
                <User className="w-[18px] h-[18px]" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm transition-opacity duration-500",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-in menu from left - light green */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-[60] w-full sm:w-[400px] bg-[#b8d4b8] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Menu header */}
        <div className="flex items-center justify-between px-8 h-16 lg:h-20">
          <span className="text-[13px] font-bold text-[#1a3a1a] uppercase tracking-widest">
            Menu
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-[#1a3a1a]/60 hover:text-[#1a3a1a] transition-colors text-[13px] font-medium tracking-wide"
          >
            {locale === "tr" ? "Kapat" : "Close"} ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-8 pt-4">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "group flex items-center justify-between py-4 border-b border-[#1a3a1a]/10 transition-all duration-300",
                menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
              )}
              style={{ transitionDelay: menuOpen ? `${(i + 1) * 60}ms` : "0ms" }}
            >
              <div className="flex items-baseline gap-4">
                <span className="text-[11px] text-[#1a3a1a]/30 font-mono">{link.num}</span>
                <span className={cn(
                  "text-2xl sm:text-3xl font-semibold text-[#1a3a1a]/70 group-hover:text-[#1a3a1a] transition-colors duration-300",
                  pathname === link.href && "text-[#1a3a1a]"
                )}>
                  {link.label}
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#1a3a1a]/0 group-hover:text-[#1a3a1a]/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-10">
          <div className="border-t border-[#1a3a1a]/10 pt-6 space-y-4">
            {/* Auth */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-[13px] text-[#1a3a1a]/50 hover:text-[#1a3a1a] transition-colors">
                  {messages.logout}
                </button>
              ) : (
                <>
                  <Link href={`/${locale}/auth/login`} onClick={() => setMenuOpen(false)} className="text-[13px] text-[#1a3a1a]/50 hover:text-[#1a3a1a] transition-colors">
                    {messages.login}
                  </Link>
                  <span className="text-[#1a3a1a]/20">|</span>
                  <Link href={`/${locale}/auth/register`} onClick={() => setMenuOpen(false)} className="text-[13px] text-[#1a3a1a]/50 hover:text-[#1a3a1a] transition-colors">
                    {messages.register}
                  </Link>
                </>
              )}
            </div>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 text-[13px] text-[#1a3a1a]/50 hover:text-[#1a3a1a] transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLang.flag} {currentLang.label}</span>
              </button>

              {langOpen && (
                <div className="absolute bottom-8 left-0 bg-white rounded-xl shadow-lg border border-[#B7C396]/30 py-2 min-w-[200px]">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLang(lang.code)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[#E0E7D7]/60 transition-colors",
                        lang.code === locale ? "text-[#1a3a1a] font-semibold bg-[#E0E7D7]/40" : "text-[#2d3a2a]/70"
                      )}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#1a3a1a]/30 pt-4">
              © {new Date().getFullYear()} Dopamind
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
