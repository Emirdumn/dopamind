"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Eye, Quote } from "lucide-react";

const ARTICLES = {
  tr: [
    {
      id: "1",
      title: "ADHD ile Zaman Yönetimi",
      slug: "adhd-zaman-yonetimi",
      excerpt: "ADHD ile zamanınızı etkili bir şekilde yönetmenin yolları ve pratik stratejiler.",
      icon: "clock",
      category: "Zaman Yönetimi",
      author: "Dr. Ayşe Yılmaz",
      views: 1250,
      date: "15 Mar 2026",
    },
    {
      id: "2",
      title: "İş Yerinde Başarı Stratejileri",
      slug: "is-yerinde-basari",
      excerpt: "İş yerinde başarı stratejileri: ADHD ile verimli çalışmanın sırları.",
      icon: "briefcase",
      category: "İş Yaşamı",
      author: "Uzm. Psk. Zeynep Kaya",
      views: 2100,
      date: "10 Mar 2026",
    },
    {
      id: "3",
      title: "Uzman Görüşü: Tanı Süreci",
      slug: "tani-sureci",
      excerpt: "Uzman Görüşü: Tanı diagnostik: Tanı sürecinde neler beklenmeli?",
      icon: "stethoscope",
      category: "Uzman Görüşü",
      author: "Prof. Dr. Hasan İnce",
      views: 890,
      date: "5 Mar 2026",
    },
    {
      id: "4",
      title: "Odaklanma Becerileri Atölyesi",
      slug: "odaklanma-atolyesi",
      excerpt: "Odaklanma becerileri küresi: odaklanma alıştırmaları ve pratik atölyeler.",
      icon: "target",
      category: "Atölye",
      author: "Pedagog Mehmet Demir",
      views: 760,
      date: "28 Şub 2026",
    },
    {
      id: "5",
      title: "ADHD ve Beslenme",
      slug: "adhd-beslenme",
      excerpt: "ADHD ve beslenme: yardımcı gıdalar, vitamin ve mineral önerileri.",
      icon: "apple",
      category: "Beslenme",
      author: "Dyt. Selin Arslan",
      views: 1540,
      date: "20 Şub 2026",
    },
  ],
  en: [
    {
      id: "1",
      title: "Time Management with ADHD",
      slug: "adhd-time-management",
      excerpt: "Effective ways to manage your time with ADHD and practical strategies.",
      icon: "clock",
      category: "Time Management",
      author: "Dr. Ayşe Yılmaz",
      views: 1250,
      date: "Mar 15, 2026",
    },
    {
      id: "2",
      title: "Workplace Success Strategies",
      slug: "workplace-success",
      excerpt: "Workplace success strategies: secrets to productive work with ADHD.",
      icon: "briefcase",
      category: "Work Life",
      author: "Psy. Zeynep Kaya",
      views: 2100,
      date: "Mar 10, 2026",
    },
    {
      id: "3",
      title: "Expert Opinion: Diagnosis Process",
      slug: "diagnosis-process",
      excerpt: "Expert Opinion: What to expect during the diagnostic process.",
      icon: "stethoscope",
      category: "Expert Opinion",
      author: "Prof. Dr. Hasan İnce",
      views: 890,
      date: "Mar 5, 2026",
    },
    {
      id: "4",
      title: "Focus Skills Workshop",
      slug: "focus-workshop",
      excerpt: "Focus skills: exercises and practical workshops for better concentration.",
      icon: "target",
      category: "Workshop",
      author: "Ped. Mehmet Demir",
      views: 760,
      date: "Feb 28, 2026",
    },
    {
      id: "5",
      title: "ADHD and Nutrition",
      slug: "adhd-nutrition",
      excerpt: "ADHD and nutrition: helpful foods, vitamin and mineral recommendations.",
      icon: "apple",
      category: "Nutrition",
      author: "Dt. Selin Arslan",
      views: 1540,
      date: "Feb 20, 2026",
    },
  ],
};

const EXPERTS = [
  { name: "Haris Estebi", title: "Psikiyatrist", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. 15 yıl deneyim." },
  { name: "Uzman Gürsöz", title: "Psikolog", desc: "Lorem ipsum dolor sit amet dolır ile uğraşarak çocuk ve gençlik 1000 vaka." },
  { name: "Kenan İnman", title: "Üniversite Doçenti", desc: "Lorem ipsum dolor sit amet, dolıre sit amet, üniversite öğretim görevlisi." },
  { name: "Asena Asman", title: "Diyetisyen", desc: "Lorem ipsum dolor sit amet, dolır sit amet, beslenme ve diyet uzmanı." },
];

const COMMUNITY_POSTS = {
  tr: [
    { id: "1", text: "ADHD konusiri için tamam! ADHD'nin bilgi sahibi olmalarında sınırsız başarılı olmak mümkün, önerileriniz harika.", author: "Dopamin Avcısı", avatar: "D" },
    { id: "2", text: "Odaklanma araclarındoğinızın duyularınız garanti olunması: kesinlikle hayatımı kolaylaştırdı!", author: "Güneş Akıllı", avatar: "G" },
    { id: "3", text: "Bütün çocuklarda artmış gelinme gösterileri çağım çoluk etme ve odağı artırmada kullanılabilir.", author: "Çok Merak", avatar: "Ç" },
  ],
  en: [
    { id: "1", text: "The resources on ADHD management have been incredibly helpful. The product recommendations are spot on!", author: "Focus Seeker", avatar: "F" },
    { id: "2", text: "The focus tools have genuinely made my daily life easier. Highly recommend the planner!", author: "Bright Mind", avatar: "B" },
    { id: "3", text: "Great community for anyone looking to understand and manage ADHD better.", author: "Curious One", avatar: "C" },
  ],
};

const ARTICLE_COLORS = [
  "from-blue-50 to-blue-100",
  "from-amber-50 to-amber-100",
  "from-[#E0E7D7]/60 to-[#E0E7D7]/80",
  "from-purple-50 to-purple-100",
  "from-rose-50 to-rose-100",
];

const ARTICLE_ICON_COLORS = [
  "text-blue-500",
  "text-amber-500",
  "text-[#5a7a52]",
  "text-purple-500",
  "text-rose-500",
];

export default function ContentPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const isTr = locale === "tr";

  const articles = ARTICLES[locale as keyof typeof ARTICLES] || ARTICLES.tr;
  const communityPosts = COMMUNITY_POSTS[locale as keyof typeof COMMUNITY_POSTS] || COMMUNITY_POSTS.tr;

  return (
    <div className="bg-[#E0E7D7] min-h-screen text-gray-900">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-28 pb-16">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 italic font-serif">
            {isTr ? "Güvenilir ADHD Rehberleri & Makaleler" : "Trusted ADHD Guides & Articles"}
          </h1>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {articles.map((article, i) => (
            <Link
              key={article.id}
              href={`/${locale}/content/${article.slug}`}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-[#B7C396]/30"
            >
              <div className={`h-36 bg-gradient-to-br ${ARTICLE_COLORS[i % ARTICLE_COLORS.length]} flex items-center justify-center`}>
                <div className={`w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm ${ARTICLE_ICON_COLORS[i % ARTICLE_ICON_COLORS.length]}`}>
                  <BookOpen className="w-7 h-7" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 group-hover:text-[#5a7a52] transition-colors mb-1.5 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.date}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Expert Team */}
        <section className="mb-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm border border-[#B7C396]/30">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 italic font-serif">
              {isTr ? "Uzman Ekibimiz" : "Our Expert Team"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {EXPERTS.map((expert) => (
                <div key={expert.name} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#B7C396] to-[#5a7a52] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{expert.name[0]}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{expert.name}</h4>
                  <p className="text-xs text-[#5a7a52] font-medium mb-1">{expert.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{expert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Posts */}
        <section>
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-sm border border-[#B7C396]/30">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 italic font-serif">
              {isTr ? "Topluluk Paylaşımları" : "Community Posts"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {communityPosts.map((post) => (
                <div key={post.id} className="bg-[#E0E7D7]/60 rounded-2xl p-6 border border-[#B7C396]/30">
                  <Quote className="w-5 h-5 text-[#d4654a] mb-3" />
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-4">&ldquo;{post.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5a7a52] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{post.avatar}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{post.author}</span>
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
