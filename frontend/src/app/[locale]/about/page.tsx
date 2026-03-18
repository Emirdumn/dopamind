"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Brain, Heart, Target, Users, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  const values = [
    {
      icon: Brain,
      title: locale === "tr" ? "Bilime Dayalı" : "Science-Based",
      desc: locale === "tr"
        ? "Tüm ürün ve içeriklerimiz bilimsel araştırmalara dayanmaktadır."
        : "All our products and content are based on scientific research.",
    },
    {
      icon: Heart,
      title: locale === "tr" ? "Empati" : "Empathy",
      desc: locale === "tr"
        ? "ADHD'li bireylerin ihtiyaçlarını anlıyor ve çözüm üretiyoruz."
        : "We understand the needs of individuals with ADHD and provide solutions.",
    },
    {
      icon: Target,
      title: locale === "tr" ? "Odaklanma" : "Focus",
      desc: locale === "tr"
        ? "Tek amacımız ADHD'li bireylerin hayatını kolaylaştırmak."
        : "Our sole purpose is to make life easier for individuals with ADHD.",
    },
    {
      icon: Users,
      title: locale === "tr" ? "Topluluk" : "Community",
      desc: locale === "tr"
        ? "Güçlü bir topluluk oluşturarak birbirimize destek oluyoruz."
        : "We support each other by building a strong community.",
    },
  ];

  return (
    <div className="pt-24 bg-[#E0E7D7] min-h-screen">
      {/* Hero */}
      <section className="bg-[#5a7a52] py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {locale === "tr" ? "Hakkımızda" : "About Us"}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {locale === "tr"
              ? "Dopamind, ADHD'li bireylerin günlük yaşamlarını kolaylaştırmak amacıyla kurulmuş bir platformdur."
              : "Dopamind is a platform established to make daily life easier for individuals with ADHD."}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2d3a2a] italic font-serif mb-4">
              {locale === "tr" ? "Misyonumuz" : "Our Mission"}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {locale === "tr"
                ? "ADHD ile yaşayan bireylerin potansiyellerini tam olarak ortaya koymalarına yardımcı olmak. Bunu, uzman seçimi ürünler, bilgilendirici içerikler ve destekleyici bir topluluk aracılığıyla gerçekleştiriyoruz."
                : "To help individuals living with ADHD fully realize their potential. We do this through expert-curated products, informative content, and a supportive community."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {values.map((value) => (
              <div key={value.title} className="p-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30 hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#E0E7D7]/40 flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-[#5a7a52]" />
                </div>
                <h3 className="text-xl font-bold text-[#2d3a2a] mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: "5000+", label: locale === "tr" ? "Mutlu Müşteri" : "Happy Customers" },
              { number: "200+", label: locale === "tr" ? "Ürün" : "Products" },
              { number: "50+", label: locale === "tr" ? "Makale" : "Articles" },
              { number: "4.8", label: locale === "tr" ? "Ortalama Puan" : "Average Rating" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
                <p className="text-3xl font-bold text-[#5a7a52]">{stat.number}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#2d3a2a] italic font-serif mb-6">
            {locale === "tr" ? "Hemen Başlayın" : "Get Started"}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#5a7a52] text-white font-semibold hover:bg-[#4a6a44] transition-all"
            >
              {locale === "tr" ? "Ürünleri Keşfet" : "Explore Products"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/content`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-white border border-gray-200 text-gray-700 font-semibold hover:border-[#5a7a52] transition-all"
            >
              {locale === "tr" ? "İçerikleri Oku" : "Read Content"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
