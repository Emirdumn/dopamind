"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, RefreshCw, Shield, Award, ShoppingCart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef } from "react";

export default function HomePage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const isTr = locale === "tr";
  const reviewsRef = useRef<HTMLDivElement>(null);

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
      tag: "Focus",
    },
    {
      name: isTr ? "Mavi Işık Gözlüğü" : "Blue Light Glasses",
      slug: "mavi-isik-filtreli-gozluk",
      image: "/products/blue-light-glasses.png",
      price: isTr ? "₺199.90" : "$11.99",
      oldPrice: isTr ? "₺349.90" : "$19.99",
      rating: 4.4,
      desc: isTr ? "Mavi ışığı filtrele, uyku kaliteni artır." : "Filter blue light, improve sleep.",
      tag: "Calm",
    },
    {
      name: isTr ? "Beyaz Gürültü Makinesi" : "White Noise Machine",
      slug: "beyaz-gurultu-makinesi",
      image: "/products/white-noise-machine.png",
      price: isTr ? "₺399.90" : "$22.99",
      oldPrice: isTr ? "₺599.90" : "$34.99",
      rating: 4.7,
      desc: isTr ? "20+ ses modu, derin odaklanma." : "20+ sound modes, deep focus.",
      tag: "Focus",
    },
  ];

  const tagColors: Record<string, string> = {
    Focus: "bg-blue-100 text-blue-700",
    Calm: "bg-purple-100 text-purple-700",
    Organization: "bg-orange-100 text-orange-700",
  };

  const trustItems = [
    { icon: Truck, label: isTr ? "Ücretsiz Kargo" : "Free Shipping" },
    { icon: RefreshCw, label: isTr ? "30 Gün İade" : "30-Day Returns" },
    { icon: Shield, label: isTr ? "Güvenli Ödeme" : "Secure Payment" },
    { icon: Award, label: isTr ? "ADHD Uzman Onaylı" : "ADHD Expert Approved" },
  ];

  const reviews = [
    { name: "Sarah M.", rating: 5, text: isTr ? "Fidget Cube hayatımı değiştirdi! Toplantılarda çok daha odaklıyım." : "The Fidget Cube changed my life! I'm so much more focused in meetings.", avatar: "S" },
    { name: "Ahmet K.", rating: 5, text: isTr ? "Pomodoro zamanlayıcı ile ders çalışmam inanılmaz arttı. Telefon yerine bunu kullanıyorum." : "My study sessions improved incredibly with the Pomodoro timer. I use this instead of my phone.", avatar: "A" },
    { name: "Emily R.", rating: 4, text: isTr ? "Gürültü engelleyici kulaklıklar ofiste odaklanmamı sağlıyor. Kesinlikle tavsiye ederim." : "The noise cancelling earbuds help me focus at the office. Absolutely recommend.", avatar: "E" },
    { name: "Zeynep T.", rating: 5, text: isTr ? "Planlayıcı ADHD beynim için biçilmiş kaftan. Brain dump sayfaları harika!" : "The planner is perfect for my ADHD brain. Brain dump pages are amazing!", avatar: "Z" },
    { name: "James L.", rating: 4, text: isTr ? "Beyaz gürültü makinesi uyku kalitemi çok artırdı. Artık 10 dakikada uyuyorum." : "The white noise machine greatly improved my sleep quality. I fall asleep in 10 minutes now.", avatar: "J" },
    { name: "Deniz A.", rating: 5, text: isTr ? "Masa düzenleyici ile çalışma alanım hep temiz. ADHD'li herkes almalı!" : "My workspace is always clean with the desk organizer. Every ADHD person should get one!", avatar: "D" },
  ];

  const scrollReviews = (dir: "left" | "right") => {
    if (!reviewsRef.current) return;
    const amount = 340;
    reviewsRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div className="bg-[#E0E7D7]">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#E0E7D7] via-[#d4ddc8] to-[#B7C396]/40 pt-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#B7C396]/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text + buttons */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight text-[#2d3a2a]">
              {isTr ? (
                <>Beynin Farklı Çalışıyor.<br /><span className="text-[#5a7a52]">Araçların da Öyle Olmalı.</span></>
              ) : (
                <>Your Brain Works Different.<br /><span className="text-[#5a7a52]">Your Tools Should Too.</span></>
              )}
            </h1>
            <p className="text-[#4a5e44] text-base md:text-lg max-w-md mb-8 leading-relaxed">
              {isTr
                ? "ADHD ile yaşamı kolaylaştıran, uzman onaylı ürünler ve kişiselleştirilmiş öneriler."
                : "Expert-approved products and personalized recommendations that make life with ADHD easier."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#5a7a52] text-white text-sm font-semibold rounded-lg hover:bg-[#4a6a44] transition-all duration-300 shadow-lg shadow-[#5a7a52]/20"
              >
                <ShoppingCart className="w-4 h-4" />
                {isTr ? "Alışverişe Başla" : "Shop Now"}
              </Link>
              <Link
                href={`/${locale}/assessment`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/70 backdrop-blur-sm text-[#2d3a2a] text-sm font-semibold rounded-lg border border-[#B7C396]/40 hover:bg-white hover:border-[#5a7a52] transition-all duration-300"
              >
                {isTr ? "ADHD Testini Çöz" : "Take ADHD Test"}
              </Link>
            </div>
          </div>

          {/* Right: product collage */}
          <div className="relative hidden lg:block h-[420px]">
            <div className="absolute top-0 right-0 w-52 h-52 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#B7C396]/30 overflow-hidden shadow-lg rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image src="/products/fidget-cube.png" alt="Fidget Cube" fill className="object-contain p-4" />
            </div>
            <div className="absolute top-16 left-8 w-56 h-56 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#B7C396]/30 overflow-hidden shadow-lg -rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image src="/products/pomodoro-timer.png" alt="Timer" fill className="object-contain p-4" />
            </div>
            <div className="absolute bottom-0 right-12 w-48 h-48 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#B7C396]/30 overflow-hidden shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500">
              <Image src="/products/noise-cancel-earbuds.png" alt="Earbuds" fill className="object-contain p-4" />
            </div>
            <div className="absolute bottom-10 left-0 w-44 h-44 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#B7C396]/30 overflow-hidden shadow-lg -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Image src="/products/focus-planner.png" alt="Planner" fill className="object-contain p-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="bg-white/60 backdrop-blur-sm border-y border-[#B7C396]/20">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-3 py-2">
                <item.icon className="w-5 h-5 text-[#5a7a52] flex-shrink-0" />
                <span className="text-sm font-medium text-[#2d3a2a]">{item.label}</span>
              </div>
            ))}
          </div>
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
                className="group bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-[#B7C396]/30"
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
              <div
                key={product.slug}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white hover:shadow-lg hover:scale-[1.03] transition-all duration-300 border border-[#B7C396]/30"
              >
                <Link href={`/${locale}/products/${product.slug}`} className="block">
                  <div className="relative h-56 bg-[#E0E7D7]/40 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${tagColors[product.tag]}`}>
                      {product.tag}
                    </span>
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-[#B7C396]/40"}`} />
                    ))}
                    <span className="text-xs text-[#6b7f65] ml-1">{product.rating}</span>
                  </div>
                  <Link href={`/${locale}/products/${product.slug}`}>
                    <h3 className="text-lg font-bold text-[#2d3a2a] group-hover:text-[#5a7a52] transition-colors mb-1">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-[#6b7f65] mb-3">{product.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#2d3a2a]">{product.price}</span>
                      <span className="text-sm text-[#B7C396] line-through">{product.oldPrice}</span>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5a7a52] text-white text-xs font-semibold rounded-lg hover:bg-[#4a6a44] transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {isTr ? "Sepete Ekle" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
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

      {/* ═══ CUSTOMER REVIEWS ═══ */}
      <section className="py-16 bg-[#E0E7D7]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#2d3a2a] mb-2 italic font-serif">
                {isTr ? "Müşteri Yorumları" : "Customer Reviews"}
              </h2>
              <p className="text-[#6b7f65] text-sm">
                {isTr ? "ADHD topluluğumuzdan gerçek deneyimler." : "Real experiences from our ADHD community."}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollReviews("left")}
                className="p-2 rounded-full bg-white/70 border border-[#B7C396]/30 text-[#2d3a2a] hover:bg-white hover:shadow transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollReviews("right")}
                className="p-2 rounded-full bg-white/70 border border-[#B7C396]/30 text-[#2d3a2a] hover:bg-white hover:shadow transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={reviewsRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[310px] bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#B7C396]/30 snap-start hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#5a7a52] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{review.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2d3a2a] text-sm">{review.name}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-[#B7C396]/40"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#4a5e44] leading-relaxed">&ldquo;{review.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ASSESSMENT CTA ═══ */}
      <section className="py-20 bg-white/50">
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
