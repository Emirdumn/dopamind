"use client";

import { useParams } from "next/navigation";
import {
  Globe,
  Package,
  Shield,
  Search,
  ArrowRight,
  Factory,
  ShoppingBag,
  Users,
  BarChart3,
  Clock,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";

const SUPPLIER_PLATFORMS = [
  { name: "AliExpress", region: "Çin / Global", type: "B2C Marketplace", url: "aliexpress.com", rating: 4.2 },
  { name: "1688.com", region: "Çin", type: "B2B Toptan", url: "1688.com", rating: 4.5 },
  { name: "Alibaba", region: "Çin / Global", type: "B2B Toptan", url: "alibaba.com", rating: 4.3 },
  { name: "CJ Dropshipping", region: "Çin / ABD Depo", type: "Dropship Otomasyon", url: "cjdropshipping.com", rating: 4.6 },
  { name: "Spocket", region: "ABD / Avrupa", type: "Premium Dropship", url: "spocket.co", rating: 4.4 },
  { name: "Zendrop", region: "ABD / Çin", type: "Dropship Otomasyon", url: "zendrop.com", rating: 4.1 },
  { name: "Amazon FBA", region: "ABD / Global", type: "Fulfillment", url: "amazon.com", rating: 4.7 },
  { name: "Trendyol Marketplace", region: "Türkiye", type: "Yerel Pazar", url: "trendyol.com", rating: 4.0 },
];

const PRODUCT_CATEGORIES = {
  tr: [
    {
      category: "Fidget & Stres Giderici Ürünler",
      icon: "🎯",
      suppliers: "AliExpress, 1688, CJ Dropshipping",
      margin: "%60-80",
      demand: "Yüksek",
      examples: "Fidget Cube, Fidget Ring, Stres Topu, Pop It, Infinity Cube",
      source_price: "₺15-40",
      sell_price: "₺99-199",
      notes: "En çok satan kategori. AliExpress'te 'fidget ADHD' araması yapın. Kargo 7-15 gün.",
    },
    {
      category: "Zamanlayıcı & Odaklanma Cihazları",
      icon: "⏱️",
      suppliers: "1688, Alibaba, CJ Dropshipping",
      margin: "%50-70",
      demand: "Orta-Yüksek",
      examples: "Pomodoro Timer, Visual Timer, Time Timer, Cube Timer",
      source_price: "₺50-120",
      sell_price: "₺249-499",
      notes: "Niş ama yüksek değer. 'Visual timer ADHD' olarak arayın. Özel etiketleme (private label) imkanı var.",
    },
    {
      category: "Planlayıcı & Kırtasiye",
      icon: "📓",
      suppliers: "Alibaba, 1688, Yerel Matbaa",
      margin: "%70-85",
      demand: "Orta",
      examples: "ADHD Planner, Focus Journal, Haftalık Planlayıcı, Yapışkan Notlar",
      source_price: "₺20-60",
      sell_price: "₺199-399",
      notes: "Private label için en uygun kategori. Kendi tasarımınızı yapıp Alibaba'da bastırabilirsiniz.",
    },
    {
      category: "Ses & Gürültü Engelleme",
      icon: "🎧",
      suppliers: "AliExpress, CJ Dropshipping, Spocket",
      margin: "%40-60",
      demand: "Yüksek",
      examples: "ANC Kulaklık, Beyaz Gürültü Makinesi, Kulak Tıkacı, Loop Earplugs",
      source_price: "₺100-250",
      sell_price: "₺349-699",
      notes: "Rekabet yüksek ama talep de yüksek. Kalite kontrol çok önemli. ABD deposu olan tedarikçi tercih edin.",
    },
    {
      category: "Gözlük & Işık Ürünleri",
      icon: "👓",
      suppliers: "1688, AliExpress, Alibaba",
      margin: "%65-80",
      demand: "Orta",
      examples: "Mavi Işık Gözlüğü, SAD Lamba, Gece Gözlüğü",
      source_price: "₺25-80",
      sell_price: "₺149-349",
      notes: "Mavi ışık gözlükleri çok düşük maliyetli. CE sertifikalı olanları seçin.",
    },
    {
      category: "Masa & Organizasyon",
      icon: "🗂️",
      suppliers: "1688, Alibaba, CJ Dropshipping",
      margin: "%50-65",
      demand: "Orta",
      examples: "Masa Düzenleyici, Kablo Organizer, Whiteboard, Timer Stand",
      source_price: "₺60-150",
      sell_price: "₺299-599",
      notes: "Hacimli ürünler, kargo maliyetine dikkat. Yerel depo kullanımı avantajlı.",
    },
  ],
  en: [
    {
      category: "Fidget & Stress Relief Products",
      icon: "🎯",
      suppliers: "AliExpress, 1688, CJ Dropshipping",
      margin: "60-80%",
      demand: "High",
      examples: "Fidget Cube, Fidget Ring, Stress Ball, Pop It, Infinity Cube",
      source_price: "$1-3",
      sell_price: "$7-15",
      notes: "Best selling category. Search 'fidget ADHD' on AliExpress. Shipping 7-15 days.",
    },
    {
      category: "Timer & Focus Devices",
      icon: "⏱️",
      suppliers: "1688, Alibaba, CJ Dropshipping",
      margin: "50-70%",
      demand: "Medium-High",
      examples: "Pomodoro Timer, Visual Timer, Time Timer, Cube Timer",
      source_price: "$4-8",
      sell_price: "$15-30",
      notes: "Niche but high value. Search 'visual timer ADHD'. Private label opportunity available.",
    },
    {
      category: "Planners & Stationery",
      icon: "📓",
      suppliers: "Alibaba, 1688, Local Print",
      margin: "70-85%",
      demand: "Medium",
      examples: "ADHD Planner, Focus Journal, Weekly Planner, Sticky Notes",
      source_price: "$1-4",
      sell_price: "$12-25",
      notes: "Best category for private label. Design your own and print on Alibaba.",
    },
    {
      category: "Audio & Noise Cancelling",
      icon: "🎧",
      suppliers: "AliExpress, CJ Dropshipping, Spocket",
      margin: "40-60%",
      demand: "High",
      examples: "ANC Earbuds, White Noise Machine, Earplugs, Loop Earplugs",
      source_price: "$7-18",
      sell_price: "$22-45",
      notes: "High competition but high demand. Quality control is critical. Prefer suppliers with US warehouse.",
    },
    {
      category: "Glasses & Light Products",
      icon: "👓",
      suppliers: "1688, AliExpress, Alibaba",
      margin: "65-80%",
      demand: "Medium",
      examples: "Blue Light Glasses, SAD Lamp, Night Glasses",
      source_price: "$2-5",
      sell_price: "$10-22",
      notes: "Blue light glasses are very low cost. Choose CE certified ones.",
    },
    {
      category: "Desk & Organization",
      icon: "🗂️",
      suppliers: "1688, Alibaba, CJ Dropshipping",
      margin: "50-65%",
      demand: "Medium",
      examples: "Desk Organizer, Cable Organizer, Whiteboard, Timer Stand",
      source_price: "$4-10",
      sell_price: "$18-38",
      notes: "Bulky products, watch shipping costs. Local warehouse usage is advantageous.",
    },
  ],
};

export default function OperationsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const isTr = locale === "tr";
  const categories = PRODUCT_CATEGORIES[locale as keyof typeof PRODUCT_CATEGORIES] || PRODUCT_CATEGORIES.tr;

  const steps = isTr
    ? [
        { icon: Search, title: "Ürün Araştırma", desc: "AliExpress, 1688 ve Alibaba'da ADHD niş ürünleri araştırın. Trend olan ve yüksek puanlı ürünleri belirleyin." },
        { icon: Factory, title: "Tedarikçi Seçimi", desc: "En az 3 tedarikçiden numune isteyin. Kalite, fiyat ve kargo süresini karşılaştırın." },
        { icon: Shield, title: "Kalite Kontrol", desc: "Numuneleri test edin. Sertifikaları (CE, FCC, FDA) doğrulayın. Müşteri yorumlarını inceleyin." },
        { icon: Package, title: "Listeleme & Fiyatlama", desc: "Dopamind'da ürünü listeleyin. Maliyet + kargo + %50-80 kar marjı ekleyerek fiyat belirleyin." },
        { icon: ShoppingBag, title: "Sipariş & Kargo", desc: "Müşteri siparişini alın, tedarikçiye otomatik iletin. CJ Dropshipping ile otomasyon kurabilirsiniz." },
        { icon: Users, title: "Müşteri Hizmeti", desc: "Kargo takibi, iade yönetimi ve müşteri memnuniyeti. 7/24 WhatsApp destek hattı." },
      ]
    : [
        { icon: Search, title: "Product Research", desc: "Research ADHD niche products on AliExpress, 1688 and Alibaba. Identify trending, high-rated items." },
        { icon: Factory, title: "Supplier Selection", desc: "Request samples from at least 3 suppliers. Compare quality, price and shipping time." },
        { icon: Shield, title: "Quality Control", desc: "Test samples. Verify certifications (CE, FCC, FDA). Review customer feedback." },
        { icon: Package, title: "Listing & Pricing", desc: "List product on Dopamind. Set price with cost + shipping + 50-80% profit margin." },
        { icon: ShoppingBag, title: "Order & Shipping", desc: "Receive customer order, auto-forward to supplier. Set up automation with CJ Dropshipping." },
        { icon: Users, title: "Customer Service", desc: "Shipping tracking, return management and customer satisfaction. 24/7 WhatsApp support." },
      ];

  const metrics = isTr
    ? [
        { icon: BarChart3, value: "₺130-600", label: "Ort. Ürün Fiyatı" },
        { icon: Zap, value: "%50-85", label: "Kar Marjı" },
        { icon: Clock, value: "7-15 gün", label: "Kargo Süresi" },
        { icon: Star, value: "4.5+", label: "Min. Tedarikçi Puanı" },
      ]
    : [
        { icon: BarChart3, value: "$8-35", label: "Avg. Product Price" },
        { icon: Zap, value: "50-85%", label: "Profit Margin" },
        { icon: Clock, value: "7-15 days", label: "Shipping Time" },
        { icon: Star, value: "4.5+", label: "Min. Supplier Rating" },
      ];

  return (
    <div className="min-h-screen bg-[#E0E7D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5a7a52]/10 text-[#5a7a52] text-sm font-medium mb-4">
          <Globe className="w-4 h-4" />
          {isTr ? "Dropshipping Operasyon Ağı" : "Dropshipping Operations Network"}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2d3a2a] mb-4">
          {isTr ? "Ürün Tedarik & Operasyon Sistemi" : "Product Sourcing & Operations System"}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {isTr
            ? "Dünya genelindeki güvenilir tedarikçilerden ADHD ürünleri tedarik ediyoruz. İşte operasyon ağımızın nasıl çalıştığı."
            : "We source ADHD products from trusted suppliers worldwide. Here's how our operations network works."}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30 text-center">
            <metric.icon className="w-8 h-8 text-[#5a7a52] mx-auto mb-3" />
            <p className="text-2xl font-bold text-[#5a7a52]">{metric.value}</p>
            <p className="text-sm text-[#2d3a2a] mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#2d3a2a] italic font-serif text-center mb-10">
          {isTr ? "Nasıl Çalışır?" : "How It Works?"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#5a7a52] text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <step.icon className="w-5 h-5 text-[#5a7a52]" />
              </div>
              <h3 className="font-bold text-[#2d3a2a] mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Platforms */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#2d3a2a] italic font-serif text-center mb-10">
          {isTr ? "Tedarikçi Platformları" : "Supplier Platforms"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPLIER_PLATFORMS.map((platform) => (
            <div key={platform.name} className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
              <h3 className="font-bold text-[#2d3a2a] mb-1">{platform.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{platform.url}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{platform.region}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-[#2d3a2a] font-medium">{platform.rating}</span>
                </div>
              </div>
              <span className="inline-block mt-2 px-2.5 py-1 rounded-lg bg-[#5a7a52]/10 text-[#5a7a52] text-xs font-medium">
                {platform.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Product Categories with Margins */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#2d3a2a] italic font-serif text-center mb-4">
          {isTr ? "Ürün Kategorileri & Kar Marjları" : "Product Categories & Profit Margins"}
        </h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          {isTr
            ? "Her kategorideki tahmini tedarik fiyatı, satış fiyatı ve kar marjı bilgileri"
            : "Estimated source price, sell price and profit margin for each category"}
        </p>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.category} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-3 lg:w-72">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-[#2d3a2a]">{cat.category}</h3>
                    <p className="text-xs text-gray-600">{cat.suppliers}</p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{isTr ? "Tedarik" : "Source"}</p>
                    <p className="font-semibold text-gray-600">{cat.source_price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{isTr ? "Satış" : "Sell"}</p>
                    <p className="font-semibold text-gray-600">{cat.sell_price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{isTr ? "Kar Marjı" : "Margin"}</p>
                    <p className="font-semibold text-[#5a7a52]">{cat.margin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{isTr ? "Talep" : "Demand"}</p>
                    <p className="font-semibold text-[#5a7a52]">{cat.demand}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#B7C396]/30">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-[#2d3a2a]">{isTr ? "Örnekler: " : "Examples: "}</span>
                  {cat.examples}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium text-[#2d3a2a]">{isTr ? "Not: " : "Note: "}</span>
                  {cat.notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Stack */}
      <div className="mb-16 p-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
        <h2 className="text-2xl font-bold text-[#2d3a2a] italic font-serif text-center mb-8">
          {isTr ? "Otomasyon Teknoloji Yığını" : "Automation Tech Stack"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "CJ Dropshipping", desc: isTr ? "Otomatik sipariş iletme" : "Auto order forwarding" },
            { name: "Oberlo / DSers", desc: isTr ? "AliExpress entegrasyonu" : "AliExpress integration" },
            { name: "AfterShip", desc: isTr ? "Kargo takip sistemi" : "Shipment tracking system" },
            { name: "Zendesk / Crisp", desc: isTr ? "Müşteri destek chatbot" : "Customer support chatbot" },
          ].map((tool) => (
            <div key={tool.name} className="p-4 rounded-xl bg-[#E0E7D7]/40 border border-[#B7C396]/30">
              <h3 className="font-bold text-[#2d3a2a] mb-1">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
        <h3 className="text-xl font-bold text-[#2d3a2a] mb-2">
          {isTr ? "Ürünleri Keşfedin" : "Explore Products"}
        </h3>
        <p className="text-gray-600 mb-6">
          {isTr
            ? "Tüm bu tedarik ağı üzerinden seçilmiş ürünleri Dopamind mağazamızda inceleyin."
            : "Browse products curated through our supply network at the Dopamind store."}
        </p>
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5a7a52] text-white font-semibold hover:bg-[#4a6a44] transition-colors"
        >
          {isTr ? "Mağazaya Git" : "Go to Store"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      </div>
    </div>
  );
}
