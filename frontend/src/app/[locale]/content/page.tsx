"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, Quote, Calendar } from "lucide-react";
import { useState } from "react";

type BlogCategory = "all" | "tips" | "guides" | "stories";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  categoryLabel: string;
  author: string;
  date: string;
  readTime: string;
}

const ARTICLES: Record<string, Article[]> = {
  tr: [
    {
      id: "1",
      title: "ADHD ile Zaman Yönetimi: Pratik 7 Strateji",
      slug: "adhd-zaman-yonetimi",
      excerpt: "ADHD ile zamanınızı etkili bir şekilde yönetmenin yolları ve günlük hayatta uygulayabileceğiniz pratik stratejiler.",
      category: "tips",
      categoryLabel: "ADHD İpuçları",
      author: "Dr. Ayşe Yılmaz",
      date: "15 Mar 2026",
      readTime: "5 dk",
    },
    {
      id: "2",
      title: "İş Yerinde ADHD: Başarı İçin 10 Altın Kural",
      slug: "is-yerinde-basari",
      excerpt: "İş yerinde ADHD ile verimli çalışmanın sırları. Kariyerinizi şekillendirecek stratejiler.",
      category: "tips",
      categoryLabel: "ADHD İpuçları",
      author: "Uzm. Psk. Zeynep Kaya",
      date: "10 Mar 2026",
      readTime: "7 dk",
    },
    {
      id: "3",
      title: "Fidget Cube Rehberi: Hangisi Size Uygun?",
      slug: "fidget-cube-rehberi",
      excerpt: "Fidget Cube çeşitlerini karşılaştırın, ADHD tipinize en uygun modeli bulun.",
      category: "guides",
      categoryLabel: "Ürün Rehberi",
      author: "Dopamind Ekibi",
      date: "8 Mar 2026",
      readTime: "4 dk",
    },
    {
      id: "4",
      title: "Pomodoro Tekniği ile ADHD Yönetimi",
      slug: "pomodoro-teknik-rehber",
      excerpt: "Pomodoro zamanlayıcı ile odaklanma sürelerinizi nasıl optimize edebilirsiniz? Adım adım rehber.",
      category: "guides",
      categoryLabel: "Ürün Rehberi",
      author: "Pedagog Mehmet Demir",
      date: "5 Mar 2026",
      readTime: "6 dk",
    },
    {
      id: "5",
      title: "Tanımdan Başarıya: Ahmet'in ADHD Hikayesi",
      slug: "ahmetin-hikayesi",
      excerpt: "Üniversitede tanı alan Ahmet, doğru araçlarla nasıl başarılı bir mühendis oldu?",
      category: "stories",
      categoryLabel: "Başarı Hikayesi",
      author: "Ahmet K.",
      date: "28 Şub 2026",
      readTime: "8 dk",
    },
    {
      id: "6",
      title: "ADHD ve Beslenme: Beyin Dostu Gıdalar",
      slug: "adhd-beslenme",
      excerpt: "ADHD belirtilerini azaltmaya yardımcı gıdalar, vitamin ve mineral önerileri.",
      category: "tips",
      categoryLabel: "ADHD İpuçları",
      author: "Dyt. Selin Arslan",
      date: "20 Şub 2026",
      readTime: "5 dk",
    },
    {
      id: "7",
      title: "Gürültü Engelleyici Kulaklık Karşılaştırması",
      slug: "kulaklik-karsilastirma",
      excerpt: "ADHD için en iyi gürültü engelleyici kulaklıkları inceledik. Fiyat-performans analizi.",
      category: "guides",
      categoryLabel: "Ürün Rehberi",
      author: "Dopamind Ekibi",
      date: "15 Şub 2026",
      readTime: "6 dk",
    },
    {
      id: "8",
      title: "Zeynep'in Hikayesi: ADHD ile Girişimcilik",
      slug: "zeynepin-hikayesi",
      excerpt: "ADHD'yi süper güce çeviren Zeynep, kendi şirketini kurarak binlerce kişiye ilham veriyor.",
      category: "stories",
      categoryLabel: "Başarı Hikayesi",
      author: "Zeynep T.",
      date: "10 Şub 2026",
      readTime: "7 dk",
    },
  ],
  en: [
    {
      id: "1",
      title: "Time Management with ADHD: 7 Practical Strategies",
      slug: "adhd-time-management",
      excerpt: "Effective ways to manage your time with ADHD and practical strategies you can implement in daily life.",
      category: "tips",
      categoryLabel: "ADHD Tips",
      author: "Dr. Ayşe Yılmaz",
      date: "Mar 15, 2026",
      readTime: "5 min",
    },
    {
      id: "2",
      title: "ADHD at Work: 10 Golden Rules for Success",
      slug: "workplace-success",
      excerpt: "Secrets to productive work with ADHD. Strategies that will shape your career.",
      category: "tips",
      categoryLabel: "ADHD Tips",
      author: "Psy. Zeynep Kaya",
      date: "Mar 10, 2026",
      readTime: "7 min",
    },
    {
      id: "3",
      title: "Fidget Cube Guide: Which One Suits You?",
      slug: "fidget-cube-guide",
      excerpt: "Compare Fidget Cube varieties and find the model best suited to your ADHD type.",
      category: "guides",
      categoryLabel: "Product Guide",
      author: "Dopamind Team",
      date: "Mar 8, 2026",
      readTime: "4 min",
    },
    {
      id: "4",
      title: "ADHD Management with the Pomodoro Technique",
      slug: "pomodoro-technique-guide",
      excerpt: "How can you optimize your focus sessions with a Pomodoro timer? A step-by-step guide.",
      category: "guides",
      categoryLabel: "Product Guide",
      author: "Ped. Mehmet Demir",
      date: "Mar 5, 2026",
      readTime: "6 min",
    },
    {
      id: "5",
      title: "From Diagnosis to Success: Ahmet's ADHD Story",
      slug: "ahmets-story",
      excerpt: "Diagnosed in college, how Ahmet became a successful engineer with the right tools.",
      category: "stories",
      categoryLabel: "Success Story",
      author: "Ahmet K.",
      date: "Feb 28, 2026",
      readTime: "8 min",
    },
    {
      id: "6",
      title: "ADHD and Nutrition: Brain-Friendly Foods",
      slug: "adhd-nutrition",
      excerpt: "Foods that help reduce ADHD symptoms, along with vitamin and mineral recommendations.",
      category: "tips",
      categoryLabel: "ADHD Tips",
      author: "Dt. Selin Arslan",
      date: "Feb 20, 2026",
      readTime: "5 min",
    },
    {
      id: "7",
      title: "Noise Cancelling Headphones Comparison",
      slug: "headphones-comparison",
      excerpt: "We reviewed the best noise-cancelling headphones for ADHD. Price-performance analysis.",
      category: "guides",
      categoryLabel: "Product Guide",
      author: "Dopamind Team",
      date: "Feb 15, 2026",
      readTime: "6 min",
    },
    {
      id: "8",
      title: "Zeynep's Story: Entrepreneurship with ADHD",
      slug: "zeyneps-story",
      excerpt: "Turning ADHD into a superpower, Zeynep inspires thousands by founding her own company.",
      category: "stories",
      categoryLabel: "Success Story",
      author: "Zeynep T.",
      date: "Feb 10, 2026",
      readTime: "7 min",
    },
  ],
};

const CATEGORY_COLORS: Record<BlogCategory, string> = {
  all: "",
  tips: "bg-blue-100 text-blue-700",
  guides: "bg-orange-100 text-orange-700",
  stories: "bg-purple-100 text-purple-700",
};

const CARD_GRADIENTS = [
  "from-blue-50 to-blue-100",
  "from-amber-50 to-amber-100",
  "from-[#E0E7D7]/60 to-[#E0E7D7]/80",
  "from-purple-50 to-purple-100",
  "from-rose-50 to-rose-100",
  "from-teal-50 to-teal-100",
  "from-orange-50 to-orange-100",
  "from-indigo-50 to-indigo-100",
];

const EXPERTS = [
  { name: "Haris Estebi", title: "Psikiyatrist", desc: "15 yıllık deneyim ile ADHD tanı ve tedavi süreçlerinde uzman." },
  { name: "Uzman Gürsöz", title: "Psikolog", desc: "Çocuk ve gençlik psikolojisi alanında 1000+ vaka deneyimi." },
  { name: "Kenan İnman", title: "Üniversite Doçenti", desc: "ADHD araştırmaları ve nörobilim alanında akademik çalışmalar." },
  { name: "Asena Asman", title: "Diyetisyen", desc: "ADHD dostu beslenme planları ve nörobeslenme uzmanı." },
];

const COMMUNITY_POSTS = {
  tr: [
    { id: "1", text: "Dopamind'ın ADHD yönetimi kaynakları inanılmaz faydalı oldu. Ürün önerileri tam isabetli!", author: "Dopamin Avcısı", avatar: "D" },
    { id: "2", text: "Odaklanma araçları günlük hayatımı gerçekten kolaylaştırdı. Planlayıcıyı kesinlikle öneriyorum!", author: "Güneş Akıllı", avatar: "G" },
    { id: "3", text: "ADHD'yi daha iyi anlamak ve yönetmek isteyen herkes için harika bir topluluk.", author: "Çok Merak", avatar: "Ç" },
  ],
  en: [
    { id: "1", text: "The resources on ADHD management have been incredibly helpful. The product recommendations are spot on!", author: "Focus Seeker", avatar: "F" },
    { id: "2", text: "The focus tools have genuinely made my daily life easier. Highly recommend the planner!", author: "Bright Mind", avatar: "B" },
    { id: "3", text: "Great community for anyone looking to understand and manage ADHD better.", author: "Curious One", avatar: "C" },
  ],
};

export default function ContentPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const isTr = locale === "tr";
  const [activeCategory, setActiveCategory] = useState<BlogCategory>("all");

  const articles = ARTICLES[locale as keyof typeof ARTICLES] || ARTICLES.tr;
  const communityPosts = COMMUNITY_POSTS[locale as keyof typeof COMMUNITY_POSTS] || COMMUNITY_POSTS.tr;

  const filteredArticles = activeCategory === "all" ? articles : articles.filter((a) => a.category === activeCategory);

  const categoryFilters: { key: BlogCategory; label: string }[] = [
    { key: "all", label: isTr ? "Tümü" : "All" },
    { key: "tips", label: isTr ? "ADHD İpuçları" : "ADHD Tips" },
    { key: "guides", label: isTr ? "Ürün Rehberleri" : "Product Guides" },
    { key: "stories", label: isTr ? "Başarı Hikayeleri" : "Success Stories" },
  ];

  return (
    <div className="bg-[#E0E7D7] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-28 pb-16">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2d3a2a] italic font-serif mb-2">
            {isTr ? "Dopamind Blog" : "Dopamind Blog"}
          </h1>
          <p className="text-[#6b7f65] text-base">
            {isTr
              ? "ADHD hakkında uzman içerikler, ürün rehberleri ve ilham verici hikayeler."
              : "Expert content about ADHD, product guides, and inspiring stories."}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categoryFilters.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.key
                  ? "bg-[#5a7a52] text-white shadow-md"
                  : "bg-white/70 text-[#2d3a2a] border border-[#B7C396]/30 hover:bg-white hover:border-[#5a7a52]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredArticles.map((article, i) => (
            <Link
              key={article.id}
              href={`/${locale}/content/${article.slug}`}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 border border-[#B7C396]/30"
            >
              <div className={`h-40 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex items-center justify-center relative`}>
                <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
                  <BookOpen className="w-6 h-6 text-[#5a7a52]" />
                </div>
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[article.category]}`}>
                  {article.categoryLabel}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#2d3a2a] group-hover:text-[#5a7a52] transition-colors mb-2 line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-[#6b7f65] line-clamp-2 mb-4 leading-relaxed">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-[#6b7f65]/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <span className="font-medium text-[#5a7a52]">{article.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16 mb-16">
            <p className="text-[#6b7f65] text-lg">
              {isTr ? "Bu kategoride henüz içerik yok." : "No content in this category yet."}
            </p>
          </div>
        )}

        {/* Expert Team */}
        <section className="mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm border border-[#B7C396]/30">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2a] text-center mb-8 italic font-serif">
              {isTr ? "Uzman Ekibimiz" : "Our Expert Team"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {EXPERTS.map((expert) => (
                <div key={expert.name} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#B7C396] to-[#5a7a52] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{expert.name[0]}</span>
                  </div>
                  <h4 className="font-bold text-[#2d3a2a] text-sm">{expert.name}</h4>
                  <p className="text-xs text-[#5a7a52] font-medium mb-1">{expert.title}</p>
                  <p className="text-xs text-[#6b7f65] leading-relaxed line-clamp-3">{expert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Posts */}
        <section>
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm border border-[#B7C396]/30">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2d3a2a] text-center mb-8 italic font-serif">
              {isTr ? "Topluluk Paylaşımları" : "Community Posts"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {communityPosts.map((post) => (
                <div key={post.id} className="bg-[#E0E7D7]/60 rounded-2xl p-6 border border-[#B7C396]/30">
                  <Quote className="w-5 h-5 text-[#5a7a52] mb-3" />
                  <p className="text-sm text-[#4a5e44] leading-relaxed mb-4 line-clamp-4">&ldquo;{post.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5a7a52] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{post.avatar}</span>
                    </div>
                    <span className="text-sm font-medium text-[#2d3a2a]">{post.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
