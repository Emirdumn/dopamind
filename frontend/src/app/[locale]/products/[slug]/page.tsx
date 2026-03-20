"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RefreshCw, Package, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const ALL_PRODUCTS_TR = {
    "fidget-cube-stres-kupu": {
      id: "1",
      name: "Fidget Cube - 6 Yüzlü Stres Küpü",
      slug: "fidget-cube-stres-kupu",
      description: `Fidget Cube, ADHD'li bireylerin toplantılarda, derslerde ve çalışma anlarında ellerini meşgul tutarak odaklanmalarını artırmak için tasarlanmış 6 yüzlü bir stres oyuncağıdır.

Her yüzünde farklı bir dokunsal aktivite bulunur: butonlar, joystick, çevirme diski, kaydırma çubuğu, döner bilye ve endişe taşı. Sessiz modda toplantılarda rahatsızlık vermeden kullanabilirsiniz.

Araştırmalar, ADHD bireylerinin elleriyle uğraşırken beynin dikkat merkezlerinin daha aktif hale geldiğini göstermektedir. Fidget Cube bu bilimsel gerçeğe dayanarak tasarlanmıştır.

Özellikler:
• 6 farklı dokunsal yüzey
• Sessiz mod (toplantı dostu)
• Dayanıklı medikal silikon
• Cep boyutu (3.3 x 3.3 cm)
• BPA-free, güvenli malzeme
• 3 renk seçeneği`,
      short_description: "Toplantıda, derste veya çalışırken ellerinizi meşgul tutarak odaklanmanızı artırır.",
      product_type: "physical",
      price_try: "149.90",
      price_usd: "8.99",
      compare_at_price_try: "249.90",
      compare_at_price_usd: "14.99",
      stock: 120,
      is_in_stock: true,
      image: "/products/fidget-cube.png",
      category: { name: "Stres Giderici", slug: "stres-giderici" },
      is_featured: true,
      avg_rating: 4.7,
      review_count: 89,
      reviews: [
        { id: "r1", user_name: "Zeynep K.", rating: 5, comment: "İnanılmaz faydalı! Toplantılarda artık tırnaklarımı yemek yerine bunu kullanıyorum. Odaklanmam kesinlikle arttı.", created_at: "2026-03-10" },
        { id: "r2", user_name: "Burak M.", rating: 5, comment: "ADHD teşhisim var ve bu küçük küp hayatımı değiştirdi. Sessiz modu harika, ofiste kimse fark etmiyor.", created_at: "2026-02-28" },
        { id: "r3", user_name: "Elif S.", rating: 4, comment: "Kalitesi çok iyi, çocuğum için aldım. Ders çalışırken çok yardımcı oluyor.", created_at: "2026-02-15" },
      ],
      benefits: ["Odaklanmayı artırır", "Anksiyeteyi azaltır", "Sessiz kullanım", "Taşıması kolay"],
      source: "ABD tasarım, Çin üretim, CE sertifikalı",
    },
    "focus-timer-pomodoro": {
      id: "2",
      name: "Focus Timer - Pomodoro Zamanlayıcı",
      slug: "focus-timer-pomodoro",
      description: `Focus Timer, ADHD beyni için özel olarak tasarlanmış dijital Pomodoro zamanlayıcıdır. Telefon uygulamaları yerine fiziksel bir cihaz kullanmak, ekran dikkat dağıtıcılığını ortadan kaldırır.

ADHD'liler için en etkili zaman yönetimi tekniklerinden biri olan Pomodoro Tekniği'ni kolaylaştırır.

Özellikler:
• 25/5 ve 50/10 dakika Pomodoro modları
• Özel ADHD modu (esnek süreler)
• Sessiz titreşim bildirimi
• E-ink ekran (göz yormaz)
• USB-C şarj
• 30 gün pil ömrü`,
      short_description: "ADHD'liler için tasarlanmış dijital Pomodoro zamanlayıcı.",
      product_type: "physical",
      price_try: "299.90",
      price_usd: "17.99",
      compare_at_price_try: "449.90",
      compare_at_price_usd: "24.99",
      stock: 85,
      is_in_stock: true,
      image: "/products/pomodoro-timer.png",
      category: { name: "Odaklanma Araçları", slug: "odaklanma-araclari" },
      is_featured: true,
      avg_rating: 4.9,
      review_count: 156,
      reviews: [
        { id: "r1", user_name: "Ahmet Y.", rating: 5, comment: "Telefon uygulaması kullanırken sürekli dikkatim dağılıyordu. Bu cihaz sorunu çözdü.", created_at: "2026-03-12" },
        { id: "r2", user_name: "Seda T.", rating: 5, comment: "Sınav döneminde aldım, notlarım gözle görülür şekilde yükseldi.", created_at: "2026-03-01" },
      ],
      benefits: ["Ekran dikkat dağıtmaz", "Sessiz titreşim", "30 gün pil ömrü", "Bilimsel yöntem"],
      source: "Japonya tasarım, Çin üretim, FCC sertifikalı",
    },
    "adhd-focus-planner": {
      id: "3",
      name: "ADHD Focus Planner - Günlük Planlayıcı",
      slug: "adhd-focus-planner",
      description: `ADHD Focus Planner, nörobilim uzmanları ve ADHD koçlarıyla birlikte geliştirilmiş, ADHD beyni için özel yapılandırılmış bir günlük planlayıcıdır.

Normal planlayıcılar ADHD bireyler için işe yaramaz çünkü çok karmaşık veya çok basittir. Bu planlayıcı tam doğru dengeyi kurar.

Özellikler:
• 6 aylık (182 gün) günlük sayfalar
• Haftalık değerlendirme sayfaları
• Renkli zaman blokları
• Brain dump sayfaları
• Premium kalınlıkta kağıt (120gsm)`,
      short_description: "ADHD beyni için özel tasarlanmış günlük planlayıcı.",
      product_type: "physical",
      price_try: "349.90",
      price_usd: "19.99",
      compare_at_price_try: "499.90",
      compare_at_price_usd: "29.99",
      stock: 200,
      is_in_stock: true,
      image: "/products/focus-planner.png",
      category: { name: "Planlayıcılar", slug: "planlamacilar" },
      is_featured: true,
      avg_rating: 4.8,
      review_count: 203,
      reviews: [
        { id: "r1", user_name: "Deniz A.", rating: 5, comment: "İlk kez bir planlayıcıyı 3 aydan fazla kullanabiliyorum!", created_at: "2026-03-14" },
        { id: "r2", user_name: "Merve Ö.", rating: 5, comment: "Brain dump sayfaları hayat kurtarıcı.", created_at: "2026-03-05" },
      ],
      benefits: ["ADHD uzmanlarıyla tasarlandı", "Brain dump sayfaları", "Duygu takibi", "6 aylık kullanım"],
      source: "ABD tasarım, Türkiye baskı, FSC sertifikalı kağıt",
    },
    "anc-gurultu-engelleyici-kulaklik": {
      id: "4",
      name: "ANC Kulak İçi Kulaklık - Gürültü Engelleyici",
      slug: "anc-gurultu-engelleyici-kulaklik",
      description: `ADHD'li bireyler için çevresel gürültü en büyük düşmanlardan biridir. Bu aktif gürültü engelleyici kulaklıklar, etrafınızdaki dikkat dağıtıcı sesleri bloke ederek derin odaklanma moduna girmenizi sağlar.

Özellikler:
• Aktif Gürültü Engelleme (ANC)
• Transparency Mode
• 32 saat pil ömrü
• IPX5 su/ter dayanıklı
• Bluetooth 5.3`,
      short_description: "Aktif gürültü engelleme ile çevredeki dikkat dağıtıcı sesleri bloke edin.",
      product_type: "physical",
      price_try: "599.90",
      price_usd: "34.99",
      compare_at_price_try: "899.90",
      compare_at_price_usd: "49.99",
      stock: 65,
      is_in_stock: true,
      image: "/products/noise-cancel-earbuds.png",
      category: { name: "Odaklanma Araçları", slug: "odaklanma-araclari" },
      is_featured: true,
      avg_rating: 4.6,
      review_count: 134,
      reviews: [
        { id: "r1", user_name: "Ali R.", rating: 5, comment: "Ofiste odaklanmam imkansızdı, bu kulaklıklar her şeyi değiştirdi.", created_at: "2026-03-08" },
        { id: "r2", user_name: "Pınar H.", rating: 4, comment: "Ses kalitesi mükemmel, gürültü engelleme çok iyi.", created_at: "2026-02-25" },
      ],
      benefits: ["Gürültüyü %95 engeller", "32 saat pil ömrü", "Ter dayanıklı", "Transparency mode"],
      source: "Çin üretim, CE/FCC sertifikalı, 1 yıl garanti",
    },
    "bambu-masa-duzenleyici": {
      id: "5",
      name: "Bambu Masa Düzenleyici Set",
      slug: "bambu-masa-duzenleyici",
      description: `Dağınık bir masa, ADHD beyninin en büyük tetikleyicilerinden biridir. Görsel kaos, beynin işleme kapasitesini düşürür.

Özellikler:
• Doğal bambu + beyaz seramik
• Kalem tutucu bölmesi
• Telefon/tablet standı
• Mini çekmece
• Kablo yönetim slotu`,
      short_description: "Masanızdaki kaos ADHD'yi tetikler. Minimalist düzenleyici ile her şey yerinde.",
      product_type: "physical",
      price_try: "449.90",
      price_usd: "24.99",
      compare_at_price_try: "649.90",
      compare_at_price_usd: "34.99",
      stock: 95,
      is_in_stock: true,
      image: "/products/desk-organizer.png",
      category: { name: "Masa Düzeni", slug: "masa-duzeni" },
      is_featured: false,
      avg_rating: 4.5,
      review_count: 67,
      reviews: [
        { id: "r1", user_name: "Ceren D.", rating: 5, comment: "Masamdaki dağınıklık beni çıldırtıyordu. Bu düzenleyici ile her şey yerli yerinde.", created_at: "2026-03-05" },
      ],
      benefits: ["Görsel stresi azaltır", "Doğal bambu malzeme", "Kablo yönetimi", "Kolay montaj"],
      source: "Çin üretim, FSC sertifikalı bambu",
    },
    "mavi-isik-filtreli-gozluk": {
      id: "6",
      name: "Mavi Işık Filtreli Gözlük",
      slug: "mavi-isik-filtreli-gozluk",
      description: `Ekran başında geçirilen uzun saatler, mavi ışık maruziyetini artırarak melatonin üretimini baskılar.

Özellikler:
• %90 mavi ışık filtreleme
• UV400 koruma
• Hafif TR90 çerçeve (sadece 22g)
• Anti-yansıma kaplama
• Sert koruyucu kutu dahil`,
      short_description: "Ekran başında göz yorgunluğunu azaltır, uyku kalitesini artırır.",
      product_type: "physical",
      price_try: "199.90",
      price_usd: "11.99",
      compare_at_price_try: "349.90",
      compare_at_price_usd: "19.99",
      stock: 150,
      is_in_stock: true,
      image: "/products/blue-light-glasses.png",
      category: { name: "Sağlık & Uyku", slug: "saglik-uyku" },
      is_featured: true,
      avg_rating: 4.4,
      review_count: 98,
      reviews: [
        { id: "r1", user_name: "Yasemin T.", rating: 5, comment: "Gece ekrana baktıktan sonra uyumakta çok zorlanıyordum. Bu gözlükle uyku kalitem çok arttı!", created_at: "2026-03-11" },
      ],
      benefits: ["%90 mavi ışık filtresi", "Sadece 22g ağırlık", "UV400 koruma", "Koruyucu kutu dahil"],
      source: "Çin üretim, CE sertifikalı, FDA onaylı lens",
    },
    "beyaz-gurultu-makinesi": {
      id: "7",
      name: "Beyaz Gürültü Makinesi - Uyku & Odaklanma",
      slug: "beyaz-gurultu-makinesi",
      description: `ADHD beyni sessizlikte bile kendi gürültüsünü yaratır. Beyaz gürültü makinesi, beyne düzgün bir ses perdesi sunarak bu iç gürültüyü bastırır.

Özellikler:
• 20+ ses modu
• 15/30/60/120 dakika zamanlayıcı
• Hafıza fonksiyonu
• Kompakt boyut
• USB-C veya pille çalışır`,
      short_description: "20+ ses modu ile ADHD beyni için arka plan sesi oluşturarak dikkat dağınıklığını azaltır.",
      product_type: "physical",
      price_try: "399.90",
      price_usd: "22.99",
      compare_at_price_try: "599.90",
      compare_at_price_usd: "34.99",
      stock: 70,
      is_in_stock: true,
      image: "/products/white-noise-machine.png",
      category: { name: "Sağlık & Uyku", slug: "saglik-uyku" },
      is_featured: false,
      avg_rating: 4.7,
      review_count: 112,
      reviews: [
        { id: "r1", user_name: "Mert K.", rating: 5, comment: "Gece düşüncelerim durmuyor, uyuyamıyordum. Bu makine ile 10 dakikada uykuya dalıyorum!", created_at: "2026-03-09" },
      ],
      benefits: ["20+ ses modu", "Zamanlayıcı", "Hafıza fonksiyonu", "Kompakt boyut"],
      source: "Çin üretim, FCC sertifikalı",
    },
    "fidget-ring-set": {
      id: "8",
      name: "Fidget Ring Set - 4'lü Stres Yüzüğü",
      slug: "fidget-ring-set",
      description: `Fidget ring'ler, ADHD ve anksiyete yaşayan bireyler için gizlice kullanılabilen stres giderici aksesuarlardır.

Set 4 farklı renk ve tasarımda yüzük içerir. Her biri farklı bir dokunsal deneyim sunar.

Özellikler:
• 4 adet farklı tasarım
• Ayarlanabilir boyut (S/M/L)
• Hipoalerjenik silikon
• Su geçirmez
• BPA-free`,
      short_description: "Parmağınızda sessizce döndürebileceğiniz boncuklu stres yüzükleri. ADHD ve anksiyete için ideal.",
      product_type: "physical",
      price_try: "129.90",
      price_usd: "7.99",
      compare_at_price_try: "199.90",
      compare_at_price_usd: "11.99",
      stock: 300,
      is_in_stock: true,
      image: "/products/fidget-rings.png",
      category: { name: "Stres Giderici", slug: "stres-giderici" },
      is_featured: true,
      avg_rating: 4.3,
      review_count: 178,
      reviews: [
        { id: "r1", user_name: "Su N.", rating: 5, comment: "Sınavda kullanıyorum, kimse fark etmiyor. Stresimi azaltıyor.", created_at: "2026-03-13" },
        { id: "r2", user_name: "Baran A.", rating: 4, comment: "4'ü de farklı hissiyat veriyor, favorim mavi boncuklu olan.", created_at: "2026-03-02" },
      ],
      benefits: ["Gizlice kullanılır", "4 farklı tasarım", "Ayarlanabilir boyut", "Su geçirmez"],
      source: "Çin üretim, CE sertifikalı, SGS test raporu",
    },
};

type Product = (typeof ALL_PRODUCTS_TR)[keyof typeof ALL_PRODUCTS_TR];

const ALL_PRODUCTS = {
  tr: ALL_PRODUCTS_TR,
  en: {} as Record<string, Product>,
};

export default function ProductDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const slug = params?.slug as string;
  const currency = locale === "tr" ? "TRY" : "USD";

  const product: Product | undefined = ALL_PRODUCTS.tr[slug as keyof typeof ALL_PRODUCTS.tr];

  if (!product) {
    return (
      <div className="bg-[#E0E7D7] min-h-screen pt-24 text-center px-4 py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {locale === "tr" ? "Ürün Bulunamadı" : "Product Not Found"}
        </h1>
        <Link href={`/${locale}/products`} className="text-[#5a7a52] hover:text-[#4a6a44] hover:underline">
          {locale === "tr" ? "Ürünlere Dön" : "Back to Products"}
        </Link>
      </div>
    );
  }

  const price = currency === "TRY" ? product.price_try : product.price_usd;
  const comparePrice = currency === "TRY" ? product.compare_at_price_try : product.compare_at_price_usd;
  const discountPercent = comparePrice ? Math.round(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100) : 0;

  return (
    <div className="bg-[#E0E7D7] min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5a7a52] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === "tr" ? "Ürünlere Dön" : "Back to Products"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#E0E7D7]/60">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded bg-red-500 text-white text-sm font-bold">
                  -{discountPercent}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#E0E7D7]/60 text-[#4a6a44] border border-[#B7C396]/30 text-sm">
              <Package className="w-4 h-4 flex-shrink-0" />
              <span>{product.source}</span>
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#E0E7D7]/60 text-gray-600">{product.category.name}</span>
              {product.is_featured && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-600">{locale === "tr" ? "Öne Çıkan" : "Featured"}</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(product.avg_rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.avg_rating} ({product.review_count} {locale === "tr" ? "değerlendirme" : "reviews"})
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(price, currency)}</span>
              {comparePrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(comparePrice, currency)}</span>
              )}
              {discountPercent > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-600">-{discountPercent}%</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.short_description}</p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {product.benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#5a7a52] flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#5a7a52] text-white font-semibold rounded-lg hover:bg-[#4a6a44] transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {locale === "tr" ? "Sepete Ekle" : "Add to Cart"}
              </button>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg border border-gray-200 hover:border-[#5a7a52] hover:text-[#5a7a52] transition-colors">
                {locale === "tr" ? "Hemen Satın Al" : "Buy Now"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-[#E0E7D7]/40 border border-[#B7C396]/30">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#5a7a52] flex-shrink-0" />
                <span className="text-sm text-gray-600">{locale === "tr" ? "Ücretsiz Kargo" : "Free Shipping"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#5a7a52] flex-shrink-0" />
                <span className="text-sm text-gray-600">{locale === "tr" ? "Garanti" : "Warranty"}</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-[#5a7a52] flex-shrink-0" />
                <span className="text-sm text-gray-600">{locale === "tr" ? "14 Gün İade" : "14 Day Return"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16 pt-10 border-t border-[#B7C396]/30">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === "tr" ? "Ürün Açıklaması" : "Product Description"}
          </h2>
          <div className="max-w-3xl">
            {product.description.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} className="text-gray-600 leading-relaxed mb-3">{para.trim()}</p>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 pt-10 border-t border-[#B7C396]/30">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === "tr" ? "Değerlendirmeler" : "Reviews"} ({product.review_count})
          </h2>
          <div className="space-y-6 max-w-3xl">
            {product.reviews.map((review) => (
              <div key={review.id} className="p-6 rounded-xl bg-[#E0E7D7]/40 border border-[#B7C396]/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E0E7D7]/80 text-[#4a6a44] flex items-center justify-center font-bold text-sm">
                      {review.user_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.user_name}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{review.created_at}</span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
