"use client";

import Link from "next/link";

interface FooterProps {
  messages: Record<string, string>;
  locale: string;
}

/**
 * Footer.
 *
 * Soft Cloud `#f7f7f7` subsurface with a 1px Hairline top border.
 *
 * Three-column on ≥768px (Product · Company · Legal), stacked single
 * column on mobile. Each heading is 14px 600 Ink; links are 14px 500
 * Ash with Ink hover — the standard "one-step-down" emphasis copy.
 *
 * Bottom strip carries the Rausch wordmark and a 12px Mute copyright.
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
    <footer className="bg-subsurface border-t border-hairline">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-10 md:py-14">
        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="font-sans text-[14px] font-semibold text-ink mb-3">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={`${col.heading}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="font-sans text-[14px] font-medium text-ash hover:text-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-10 md:mt-14 pt-6 border-t border-hairline flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <span className="brand-gradient font-sans font-bold text-[16px] tracking-[-0.02em]">
            {messages.brand ?? "ArabaIQ"}
          </span>
          <span className="font-sans text-[12px] font-medium text-mute">
            © {year} ArabaIQ · {messages.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
