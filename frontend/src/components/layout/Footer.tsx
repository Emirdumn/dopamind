"use client";

import Link from "next/link";

interface FooterProps {
  messages: Record<string, string>;
  locale: string;
}

/**
 * Midnight Showroom footer.
 *
 * Sits on `surface-container-lowest` (#070d1f) — one step darker than
 * the main canvas so the page-to-footer transition reads as a tonal
 * descent into the void, not a line.
 *
 * **No border-top** (doc §2 "no-line rule"). The handoff from the canvas
 * (`surface`) to the footer (`surface-container-lowest`) is the divider.
 *
 * Three-column on ≥768px (Product · Company · Legal), stacked single
 * column on mobile. Each heading is 14px 600 on-surface; links are 14px
 * 500 on-surface-variant with primary hover.
 *
 * Bottom strip carries the split Araba|IQ wordmark and a 12px outline
 * copyright line.
 */
export default function Footer({ messages, locale }: FooterProps) {
  const year = new Date().getFullYear();

  const productLinks = [
    { href: `/${locale}/recommendations`, label: messages.navRecommendations },
    { href: `/${locale}/compare`,         label: messages.navCompare },
    { href: `/${locale}/garage`,          label: messages.navGarage },
  ];

  const companyLinks = [
    { href: "#", label: messages.about   ?? (locale === "tr" ? "Hakkımızda" : "About") },
    { href: "#", label: messages.contact ?? (locale === "tr" ? "İletişim"   : "Contact") },
  ];

  const legalLinks = [
    { href: "#", label: messages.privacy ?? (locale === "tr" ? "Gizlilik"                 : "Privacy") },
    { href: "#", label: messages.terms   ?? (locale === "tr" ? "Kullanım koşulları"       : "Terms") },
    { href: "#", label: messages.cookies ?? (locale === "tr" ? "Çerezler"                 : "Cookies") },
  ];

  const columns: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
    {
      heading: messages.product ?? (locale === "tr" ? "Ürün"    : "Product"),
      links:   productLinks,
    },
    {
      heading: messages.company ?? (locale === "tr" ? "Kurumsal" : "Company"),
      links:   companyLinks,
    },
    {
      heading: messages.legal   ?? (locale === "tr" ? "Yasal"    : "Legal"),
      links:   legalLinks,
    },
  ];

  return (
    <footer className="bg-surface-container-lowest">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-12 md:py-16">
        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="font-heading text-[14px] font-semibold text-on-surface mb-4 tracking-[-0.01em]">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={`${col.heading}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="font-sans text-[14px] font-medium text-on-surface-variant hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip — separation via the grid spacing, not a divider */}
        <div className="mt-14 md:mt-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <span className="font-heading font-bold text-[18px] tracking-[-0.028em] flex items-baseline">
            <span className="text-on-surface">Araba</span>
            <span className="brand-gradient">IQ</span>
          </span>
          <span className="font-sans text-[12px] font-medium text-outline">
            © {year} ArabaIQ · {messages.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
