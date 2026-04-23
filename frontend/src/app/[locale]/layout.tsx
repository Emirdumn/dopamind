import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { inter, jakarta } from "@/app/fonts";

const locales = ["tr", "en"];

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isTr = params.locale === "tr";
  return {
    title: {
      template: "%s | ArabaIQ",
      default: "ArabaIQ",
    },
    description: isTr
      ? "Veriye dayalı araç önerileri ve karşılaştırma."
      : "Data-driven car recommendations and comparison.",
  };
}

async function getMessages(locale: string) {
  try {
    return (await import(`@/i18n/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!locales.includes(locale)) notFound();

  const messages = await getMessages(locale);

  const footerMessages = { ...messages.footer, ...messages.common };

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased flex flex-col min-h-screen font-sans font-medium bg-canvas text-ink">
        <Header messages={messages.common} />
        <main className="flex-1 pt-16 pb-20 md:pt-20 md:pb-0">
          {children}
        </main>
        <Footer messages={footerMessages} locale={locale} />
        <MobileTabBar messages={messages.common} />
      </body>
    </html>
  );
}
