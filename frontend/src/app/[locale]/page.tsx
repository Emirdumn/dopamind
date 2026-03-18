"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";
  const isTr = locale === "tr";
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      name: "Fidget Cube",
      slug: "fidget-cube-stres-kupu",
      image: "/products/fidget-cube.png",
      desc: isTr
        ? "Fidget Cube, ADHD'li bireylerin odaklanmalarını artırmak için tasarlanmış 6 yüzlü stres küpüdür."
        : "Fidget Cube is a 6-sided stress cube designed to help ADHD individuals improve focus.",
    },
    {
      name: "Timer",
      slug: "focus-timer-pomodoro",
      image: "/products/pomodoro-timer.png",
      desc: isTr
        ? "Pomodoro zamanlayıcı ile odaklanma sürelerinizi yönetin ve verimliliğinizi artırın."
        : "Manage your focus sessions with the Pomodoro timer and boost productivity.",
    },
    {
      name: "Planner",
      slug: "adhd-focus-planner",
      image: "/products/focus-planner.png",
      desc: isTr
        ? "ADHD beyni için özel tasarlanmış günlük planlayıcı. Zaman blokları ve beyin dökümü sayfaları."
        : "Daily planner specially designed for the ADHD brain. Time blocks and brain dump pages.",
    },
  ];

  const featuredProducts = [
    {
      name: isTr ? "ANC Kulaklık" : "ANC Earbuds",
      slug: "anc-gurultu-engelleyici-kulaklik",
      image: "/products/noise-cancel-earbuds.png",
      price: isTr ? "₺599.90" : "$34.99",
      oldPrice: isTr ? "₺899.90" : "$49.99",
      rating: 4.6,
      desc: isTr ? "Gürültü engelleyici, odaklanma için." : "Noise cancelling, for focus.",
    },
    {
      name: isTr ? "Mavi Işık Gözlüğü" : "Blue Light Glasses",
      slug: "mavi-isik-filtreli-gozluk",
      image: "/products/blue-light-glasses.png",
      price: isTr ? "₺199.90" : "$11.99",
      oldPrice: isTr ? "₺349.90" : "$19.99",
      rating: 4.4,
      desc: isTr ? "Mavi ışığı filtrele, uyku kaliteni artır." : "Filter blue light, improve sleep.",
    },
    {
      name: isTr ? "Beyaz Gürültü Makinesi" : "White Noise Machine",
      slug: "beyaz-gurultu-makinesi",
      image: "/products/white-noise-machine.png",
      price: isTr ? "₺399.90" : "$22.99",
      oldPrice: isTr ? "₺599.90" : "$34.99",
      rating: 4.7,
      desc: isTr ? "20+ ses modu, derin odaklanma." : "20+ sound modes, deep focus.",
    },
  ];

  return (
    <div className="bg-[#E0E7D7]">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-gradient-to-br from-[#E0E7D7] via-[#d4ddc8] to-[#B7C396]/40">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#B7C396]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#E0E7D7] to-transparent" />

        <div className="relative z-10 px-6 lg:px-12 max-w-3xl">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-[0.95] mb-6 tracking-tight">
            <span className="text-[#2d3a2a]">{isTr ? "Odaklan" : "Focus"}</span>
            <br />
            <span className="text-[#5a7a52]">{isTr ? "Başar" : "Achieve"}</span>
          </h1>

          {/* Product search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) router.push(`/${locale}/products?q=${encodeURIComponent(searchQuery.trim())}`);
            }}
            className="flex items-center max-w-md mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7f65]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTr ? "Ürün ara..." : "Search products..."}
                className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-[#B7C396]/40 rounded-l-xl text-[#2d3a2a] placeholder:text-[#6b7f65]/60 focus:border-[#5a7a52] focus:bg-white/80 outline-none transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#5a7a52] text-white text-sm font-semibold rounded-r-xl hover:bg-[#4a6a44] transition-colors"
            >
              {isTr ? "Ara" : "Search"}
            </button>
          </form>

          <Link
            href={`/${locale}/assessment`}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#5a7a52] text-white text-sm font-semibold rounded-lg hover:bg-[#4a6a44] transition-all duration-300 shadow-lg shadow-[#5a7a52]/20"
          >
            {isTr ? "ADHD Testini Başlat" : "Start ADHD Test"}
          </Link>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-16 bg-[#E0E7D7]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2d3a2a] mb-2 italic font-serif">
              {isTr ? "Ayın Kategorileri" : "Categories of The Month"}
            </h2>
            <p className="text-[#6b7f65] text-sm">
              {isTr
                ? "ADHD yönetimi için en popüler ürün kategorilerimizi keşfedin."
                : "Explore our most popular product categories for ADHD management."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/products/${cat.slug}`}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white hover:shadow-md transition-all duration-300 border border-[#B7C396]/30"
              >
                <div className="relative h-48 bg-[#E0E7D7]/60 overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#2d3a2a] mb-2">{cat.name}</h3>
                  <p className="text-sm text-[#6b7f65] leading-relaxed line-clamp-3">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section className="py-16 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2d3a2a] mb-2 italic font-serif">
              {isTr ? "Öne Çıkan Ürünler" : "Featured Products"}
            </h2>
            <p className="text-[#6b7f65] text-sm">
              {isTr
                ? "Uzman onaylı, en çok tercih edilen ürünler."
                : "Expert-approved, most preferred products."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/${locale}/products/${product.slug}`}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white hover:shadow-md transition-all duration-300 border border-[#B7C396]/30"
              >
                <div className="relative h-56 bg-[#E0E7D7]/40 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(product.rating) ? "text-yellow-500" : "text-[#B7C396]/40"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-[#6b7f65] ml-1">{product.rating}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#2d3a2a] group-hover:text-[#5a7a52] transition-colors mb-1">{product.name}</h3>
                  <p className="text-sm text-[#6b7f65] mb-3">{product.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#2d3a2a]">{product.price}</span>
                    <span className="text-sm text-[#B7C396] line-through">{product.oldPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5a7a52] text-white font-semibold rounded-lg hover:bg-[#4a6a44] transition-colors text-sm"
            >
              {isTr ? "Tüm Ürünleri Gör" : "View All Products"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ ASSESSMENT CTA ═══ */}
      <section className="py-20 bg-[#E0E7D7]">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-10 md:p-14 border border-[#B7C396]/30">
            <p className="text-[#5a7a52] text-xs uppercase tracking-[0.2em] font-semibold mb-3">
              {isTr ? "Kişisel Değerlendirme" : "Personal Assessment"}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2d3a2a] mb-4 italic font-serif">
              {isTr ? "ADHD Profilini Keşfet" : "Discover Your ADHD Profile"}
            </h2>
            <p className="text-[#6b7f65] text-base max-w-md mx-auto mb-8 leading-relaxed">
              {isTr
                ? "10 soruluk değerlendirme ile ADHD profilini belirle. Sana özel ürün ve strateji önerileri al."
                : "Determine your ADHD profile with 10 questions. Get personalized product and strategy recommendations."}
            </p>
            <Link
              href={`/${locale}/assessment`}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#5a7a52] text-white font-semibold rounded-lg hover:bg-[#4a6a44] transition-colors"
            >
              {isTr ? "Teste Başla" : "Start Test"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
