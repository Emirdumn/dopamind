import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";

const locales = ["tr", "en", "es", "ru", "ar", "zh", "id"];

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: {
      template: "%s | Dopamind",
      default: "Dopamind",
    },
    description:
      params.locale === "tr"
        ? "ADHD ile yaşamı kolaylaştıran ürünler ve içerikler"
        : "Products and content that make life with ADHD easier",
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

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <>
      <Header messages={messages.common} />
      <CartSidebar messages={messages.cart} />
      <main>{children}</main>
      <Footer messages={messages.footer} commonMessages={messages.common} locale={locale} />
    </>
  );
}
