"use client";

import Link from "next/link";

interface FooterProps {
  messages: Record<string, string>;
  commonMessages: Record<string, string>;
  locale: string;
}

export default function Footer({ messages, commonMessages, locale }: FooterProps) {
  const isTr = locale === "tr";

  return (
    <footer className="bg-[#B7C396]/30 border-t border-[#B7C396]/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-base font-bold text-[#2d3a2a] mb-4 tracking-wide">DOPAMİND</h3>
            <ul className="space-y-2.5 text-sm text-[#6b7f65]">
              <li>{isTr ? "Hakkımızda" : "About Us"}</li>
              <li>
                <Link href={`/${locale}/content`} className="hover:text-[#5a7a52] transition-colors">
                  {isTr ? "Blog" : "Blog"}
                </Link>
              </li>
              <li>dopamind.com.tr</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#2d3a2a] mb-4">{messages.contact || (isTr ? "İletişim" : "Contact Us")}</h3>
            <ul className="space-y-2.5 text-sm text-[#6b7f65]">
              <li>+71 (332) 232 1272</li>
              <li>msn 0221 556 430</li>
              <li>www.dopamind.com.tr</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#2d3a2a] mb-4">{commonMessages.products}</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: `/${locale}/products/fidget-cube-stres-kupu`, label: "Fidget Cube" },
                { href: `/${locale}/products/focus-timer-pomodoro`, label: "Focus Timer" },
                { href: `/${locale}/products/adhd-focus-planner`, label: "Planner" },
                { href: `/${locale}/products`, label: isTr ? "Tüm Ürünler" : "All Products" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[#6b7f65] hover:text-[#5a7a52] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#2d3a2a] mb-4">{isTr ? "Gizlilik Politikası" : "Privacy Policy"}</h3>
            <ul className="space-y-2.5 text-sm text-[#6b7f65]">
              <li>{isTr ? "Gizlilik Politikası" : "Privacy Policy"}</li>
              <li>{isTr ? "Çerez Politikası" : "Cookie Policy"}</li>
              <li>{messages.returns || (isTr ? "İade Politikası" : "Return Policy")}</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#B7C396]/40 text-center">
          <p className="text-xs text-[#6b7f65]">
            &copy;ADHD DOPAMİND {isTr ? "Tüm Hakları Saklıdır." : "All Rights Reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
