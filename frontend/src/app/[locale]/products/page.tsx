"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Search, Brain, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";

const CATEGORIES = {
  tr: [
    { name: "Odaklanma", slug: "odaklanma", image: "/products/pomodoro-timer.png" },
    { name: "Fidget Oyuncak", slug: "fidget", image: "/products/fidget-cube.png" },
    { name: "Düzen & Planlama", slug: "duzen", image: "/products/focus-planner.png" },
  ],
  en: [
    { name: "Focus", slug: "focus", image: "/products/pomodoro-timer.png" },
    { name: "Fidget Toys", slug: "fidget", image: "/products/fidget-cube.png" },
    { name: "Organization", slug: "organization", image: "/products/focus-planner.png" },
  ],
};

const PRODUCTS = {
  tr: [
    {
      id: "1",
      name: "Fidget Cube - 6 Yüzlü Stres Küpü",
      slug: "fidget-cube-stres-kupu",
      short_description: "Toplantıda, derste veya çalışırken ellerinizi meşgul tutarak odaklanmanızı artırır. Her yüzünde farklı dokunsal aktivite.",
      product_type: "physical",
      price_try: "149.90",
      price_usd: "8.99",
      compare_at_price_try: "249.90",
      compare_at_price_usd: "14.99",
      primary_image: { image: "/products/fidget-cube.png", alt_text: "Fidget Cube Stres Küpü" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 40,
      avg_rating: 4.7,
    },
    {
      id: "2",
      name: "Focus Timer - Pomodoro Zamanlayıcı",
      slug: "focus-timer-pomodoro",
      short_description: "ADHD'liler için tasarlanmış dijital Pomodoro zamanlayıcı. 25/5 ve 50/10 dk modları, sessiz titreşim bildirimi, USB-C şarj.",
      product_type: "physical",
      price_try: "299.90",
      price_usd: "17.99",
      compare_at_price_try: "449.90",
      compare_at_price_usd: "24.99",
      primary_image: { image: "/products/pomodoro-timer.png", alt_text: "Pomodoro Zamanlayıcı" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 33,
      avg_rating: 4.9,
    },
    {
      id: "3",
      name: "ADHD Focus Planner - Günlük Planlayıcı",
      slug: "adhd-focus-planner",
      short_description: "ADHD beyni için özel tasarlanmış günlük planlayıcı. Zaman blokları, öncelik matrisi, duygu takibi ve beyin dökümü sayfaları.",
      product_type: "physical",
      price_try: "349.90",
      price_usd: "19.99",
      compare_at_price_try: "499.90",
      compare_at_price_usd: "29.99",
      primary_image: { image: "/products/focus-planner.png", alt_text: "ADHD Focus Planner" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 30,
      avg_rating: 4.8,
    },
    {
      id: "4",
      name: "ANC Kulak İçi Kulaklık - Gürültü Engelleyici",
      slug: "anc-gurultu-engelleyici-kulaklik",
      short_description: "Aktif gürültü engelleme ile çevredeki dikkat dağıtıcı sesleri bloke edin. ADHD'liler için odaklanma modunda çalışmanın anahtarı.",
      product_type: "physical",
      price_try: "599.90",
      price_usd: "34.99",
      compare_at_price_try: "899.90",
      compare_at_price_usd: "49.99",
      primary_image: { image: "/products/noise-cancel-earbuds.png", alt_text: "ANC Kulaklık" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 33,
      avg_rating: 4.6,
    },
    {
      id: "5",
      name: "Bambu Masa Düzenleyici Set",
      slug: "bambu-masa-duzenleyici",
      short_description: "Masanızdaki kaos ADHD'yi tetikler. Bu minimalist düzenleyici ile kalem, telefon, kablo ve küçük eşyalarınız hep yerinde.",
      product_type: "physical",
      price_try: "449.90",
      price_usd: "24.99",
      compare_at_price_try: "649.90",
      compare_at_price_usd: "34.99",
      primary_image: { image: "/products/desk-organizer.png", alt_text: "Masa Düzenleyici" },
      is_featured: false,
      is_in_stock: true,
      discount_percentage: 31,
      avg_rating: 4.5,
    },
    {
      id: "6",
      name: "Mavi Işık Filtreli Gözlük",
      slug: "mavi-isik-filtreli-gozluk",
      short_description: "Ekran başında geçen saatlerde göz yorgunluğunu azaltır, melatonin üretimini korur. Daha iyi uyku = daha iyi odaklanma.",
      product_type: "physical",
      price_try: "199.90",
      price_usd: "11.99",
      compare_at_price_try: "349.90",
      compare_at_price_usd: "19.99",
      primary_image: { image: "/products/blue-light-glasses.png", alt_text: "Mavi Işık Gözlüğü" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 43,
      avg_rating: 4.4,
    },
    {
      id: "7",
      name: "Beyaz Gürültü Makinesi - Uyku & Odaklanma",
      slug: "beyaz-gurultu-makinesi",
      short_description: "20+ doğa sesi ve beyaz gürültü modu. ADHD beyni için arka plan sesi oluşturarak dikkat dağınıklığını azaltır. Zamanlayıcılı.",
      product_type: "physical",
      price_try: "399.90",
      price_usd: "22.99",
      compare_at_price_try: "599.90",
      compare_at_price_usd: "34.99",
      primary_image: { image: "/products/white-noise-machine.png", alt_text: "Beyaz Gürültü Makinesi" },
      is_featured: false,
      is_in_stock: true,
      discount_percentage: 33,
      avg_rating: 4.7,
    },
    {
      id: "8",
      name: "Fidget Ring Set - 4'lü Stres Yüzüğü",
      slug: "fidget-ring-set",
      short_description: "Parmağınızda döndürebileceğiniz boncuklu stres yüzükleri. Toplantıda, sınavda sessizce kullanılabilir. Anksiyete ve ADHD için ideal.",
      product_type: "physical",
      price_try: "129.90",
      price_usd: "7.99",
      compare_at_price_try: "199.90",
      compare_at_price_usd: "11.99",
      primary_image: { image: "/products/fidget-rings.png", alt_text: "Fidget Ring Seti" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 35,
      avg_rating: 4.3,
    },
  ],
  en: [
    {
      id: "1",
      name: "Fidget Cube - 6-Sided Stress Cube",
      slug: "fidget-cube-stres-kupu",
      short_description: "Keep your hands busy during meetings, classes or work to increase focus. Different tactile activity on each face.",
      product_type: "physical",
      price_try: "149.90",
      price_usd: "8.99",
      compare_at_price_try: "249.90",
      compare_at_price_usd: "14.99",
      primary_image: { image: "/products/fidget-cube.png", alt_text: "Fidget Cube" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 40,
      avg_rating: 4.7,
    },
    {
      id: "2",
      name: "Focus Timer - Pomodoro Timer",
      slug: "focus-timer-pomodoro",
      short_description: "Digital Pomodoro timer designed for ADHD. 25/5 and 50/10 min modes, silent vibration alerts, USB-C charging.",
      product_type: "physical",
      price_try: "299.90",
      price_usd: "17.99",
      compare_at_price_try: "449.90",
      compare_at_price_usd: "24.99",
      primary_image: { image: "/products/pomodoro-timer.png", alt_text: "Pomodoro Timer" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 33,
      avg_rating: 4.9,
    },
    {
      id: "3",
      name: "ADHD Focus Planner - Daily Journal",
      slug: "adhd-focus-planner",
      short_description: "Daily planner designed for the ADHD brain. Time blocks, priority matrix, mood tracking and brain dump pages.",
      product_type: "physical",
      price_try: "349.90",
      price_usd: "19.99",
      compare_at_price_try: "499.90",
      compare_at_price_usd: "29.99",
      primary_image: { image: "/products/focus-planner.png", alt_text: "ADHD Focus Planner" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 30,
      avg_rating: 4.8,
    },
    {
      id: "4",
      name: "ANC Earbuds - Noise Cancelling",
      slug: "anc-gurultu-engelleyici-kulaklik",
      short_description: "Block distracting sounds with active noise cancellation. The key to working in focus mode for ADHD individuals.",
      product_type: "physical",
      price_try: "599.90",
      price_usd: "34.99",
      compare_at_price_try: "899.90",
      compare_at_price_usd: "49.99",
      primary_image: { image: "/products/noise-cancel-earbuds.png", alt_text: "ANC Earbuds" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 33,
      avg_rating: 4.6,
    },
    {
      id: "5",
      name: "Bamboo Desk Organizer Set",
      slug: "bambu-masa-duzenleyici",
      short_description: "Desk chaos triggers ADHD. This minimalist organizer keeps your pens, phone, cables and small items always in place.",
      product_type: "physical",
      price_try: "449.90",
      price_usd: "24.99",
      compare_at_price_try: "649.90",
      compare_at_price_usd: "34.99",
      primary_image: { image: "/products/desk-organizer.png", alt_text: "Desk Organizer" },
      is_featured: false,
      is_in_stock: true,
      discount_percentage: 31,
      avg_rating: 4.5,
    },
    {
      id: "6",
      name: "Blue Light Blocking Glasses",
      slug: "mavi-isik-filtreli-gozluk",
      short_description: "Reduces eye fatigue during screen time, preserves melatonin production. Better sleep = better focus.",
      product_type: "physical",
      price_try: "199.90",
      price_usd: "11.99",
      compare_at_price_try: "349.90",
      compare_at_price_usd: "19.99",
      primary_image: { image: "/products/blue-light-glasses.png", alt_text: "Blue Light Glasses" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 43,
      avg_rating: 4.4,
    },
    {
      id: "7",
      name: "White Noise Machine - Sleep & Focus",
      slug: "beyaz-gurultu-makinesi",
      short_description: "20+ nature sounds and white noise modes. Creates background sound for the ADHD brain to reduce distractions. With timer.",
      product_type: "physical",
      price_try: "399.90",
      price_usd: "22.99",
      compare_at_price_try: "599.90",
      compare_at_price_usd: "34.99",
      primary_image: { image: "/products/white-noise-machine.png", alt_text: "White Noise Machine" },
      is_featured: false,
      is_in_stock: true,
      discount_percentage: 33,
      avg_rating: 4.7,
    },
    {
      id: "8",
      name: "Fidget Ring Set - 4 Pack Stress Rings",
      slug: "fidget-ring-set",
      short_description: "Beaded stress rings you can spin on your finger. Can be used silently in meetings and exams. Ideal for anxiety and ADHD.",
      product_type: "physical",
      price_try: "129.90",
      price_usd: "7.99",
      compare_at_price_try: "199.90",
      compare_at_price_usd: "11.99",
      primary_image: { image: "/products/fidget-rings.png", alt_text: "Fidget Ring Set" },
      is_featured: true,
      is_in_stock: true,
      discount_percentage: 35,
      avg_rating: 4.3,
    },
  ],
};

export default function ProductsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [heroSlide, setHeroSlide] = useState(0);

  const products = PRODUCTS[locale as keyof typeof PRODUCTS] || PRODUCTS.tr;
  const categories = CATEGORIES[locale as keyof typeof CATEGORIES] || CATEGORIES.tr;

  const featuredProducts = products.filter((p) => p.is_featured);
  const heroProducts = featuredProducts.slice(0, 3);

  let filteredProducts = products.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.short_description.toLowerCase().includes(q);
    }
    return true;
  });

  if (sortBy === "price_asc") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      locale === "tr" ? parseFloat(a.price_try) - parseFloat(b.price_try) : parseFloat(a.price_usd) - parseFloat(b.price_usd)
    );
  } else if (sortBy === "price_desc") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      locale === "tr" ? parseFloat(b.price_try) - parseFloat(a.price_try) : parseFloat(b.price_usd) - parseFloat(a.price_usd)
    );
  } else if (sortBy === "rating") {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
  } else if (sortBy === "discount") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.discount_percentage - a.discount_percentage);
  }

  const sortOptions = [
    { value: "featured", label: locale === "tr" ? "Öne Çıkan" : "Featured" },
    { value: "price_asc", label: locale === "tr" ? "Fiyat: Düşükten Yükseğe" : "Price: Low to High" },
    { value: "price_desc", label: locale === "tr" ? "Fiyat: Yüksekten Düşüğe" : "Price: High to Low" },
    { value: "rating", label: locale === "tr" ? "En Yüksek Puan" : "Highest Rated" },
    { value: "discount", label: locale === "tr" ? "En Çok İndirim" : "Biggest Discount" },
  ];

  return (
    <div className="bg-[#E0E7D7] min-h-screen text-gray-900">
      {/* Hero Banner / Carousel */}
      <div className="relative bg-gradient-to-b from-[#E0E7D7]/40 to-white pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center gap-10 min-h-[360px]">
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {heroProducts[heroSlide]?.name}
              </h1>
              <p className="text-gray-500 text-base md:text-lg max-w-md leading-relaxed">
                {heroProducts[heroSlide]?.short_description}
              </p>
              <p className="text-sm text-gray-400">
                {locale === "tr"
                  ? "Dopamind ile odaklanmanızı bir üst seviyeye taşıyın."
                  : "Take your focus to the next level with Dopamind."}
              </p>
            </div>
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
              {heroProducts[heroSlide]?.primary_image && (
                <Image
                  src={heroProducts[heroSlide].primary_image!.image}
                  alt={heroProducts[heroSlide].primary_image!.alt_text}
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              )}
            </div>
          </div>
          {/* Carousel indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setHeroSlide((p) => (p - 1 + heroProducts.length) % heroProducts.length)}
              className="p-2 text-[#5a7a52] hover:text-[#4a6a44] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {heroProducts.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroSlide(i)}
                className={`w-8 h-1.5 rounded-full transition-all ${i === heroSlide ? "bg-[#5a7a52]" : "bg-gray-200"}`}
              />
            ))}
            <button
              onClick={() => setHeroSlide((p) => (p + 1) % heroProducts.length)}
              className="p-2 text-[#5a7a52] hover:text-[#4a6a44] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories of The Month */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-serif italic">
            {locale === "tr" ? "Ayın Kategorileri" : "Categories of The Month"}
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto mb-12">
            {locale === "tr"
              ? "ADHD yönetimi için en popüler ürün kategorilerimizi keşfedin."
              : "Explore our most popular product categories for ADHD management."}
          </p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug === activeCategory ? null : cat.slug)}
                className="group flex flex-col items-center gap-4"
              >
                <div className={`w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden bg-[#E0E7D7]/60 border-4 transition-all ${activeCategory === cat.slug ? "border-[#5a7a52] shadow-lg" : "border-transparent group-hover:border-[#B7C396]"}`}>
                  <div className="relative w-full h-full">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#5a7a52] transition-colors">{cat.name}</span>
                <Link
                  href="#products"
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-[#5a7a52] text-white hover:bg-[#4a6a44] transition-colors"
                >
                  {locale === "tr" ? "Alışveriş" : "Go Shop"}
                </Link>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-16 bg-[#E0E7D7]/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-serif italic">
              {locale === "tr" ? "Öne Çıkan Ürünler" : "Featured Products"}
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              {locale === "tr"
                ? "ADHD bireylerin en çok tercih ettiği, uzman onaylı ürünler."
                : "Expert-approved products most preferred by ADHD individuals."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                currency={locale === "tr" ? "TRY" : "USD"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All Products with Search & Sort */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-serif italic">
              {locale === "tr" ? "Tüm Ürünler" : "All Products"}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={locale === "tr" ? "Ürün ara..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#5a7a52] focus:ring-1 focus:ring-[#5a7a52] outline-none transition-all text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-[#5a7a52] outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  currency={locale === "tr" ? "TRY" : "USD"}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {locale === "tr" ? "Ürün bulunamadı." : "No products found."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Sourced Worldwide Banner */}
      <section className="py-12 bg-[#2d3a2a] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {locale === "tr" ? "Dünya genelinden tedarik." : "Sourced worldwide."}
            </h3>
            <p className="text-gray-400 text-sm max-w-md">
              {locale === "tr"
                ? "Tüm ürünlerimiz ABD, Avrupa ve Asya'daki güvenilir tedarikçilerden özenle seçilmektedir."
                : "All our products are carefully selected from trusted suppliers in the US, Europe and Asia."}
            </p>
          </div>
          <div className="flex gap-10">
            {[
              { v: "14", l: locale === "tr" ? "Ülke" : "Countries" },
              { v: "50+", l: locale === "tr" ? "Tedarikçi" : "Suppliers" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-3xl font-bold text-[#5a7a52]">{s.v}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
