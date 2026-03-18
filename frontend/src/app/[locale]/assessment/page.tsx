"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  User,
  GraduationCap,
  Briefcase,
  Clock,
  Moon,
  Zap,
  Heart,
  CheckCircle,
  Sparkles,
  Target,
  ShoppingCart,
  Star,
  AlertTriangle,
  TrendingUp,
  Coffee,
  BookOpen,
  Shield,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────
interface Question {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  type: "single" | "multi" | "slider";
  options?: { value: string; label: string; emoji?: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

interface UserProfile {
  screenTime: string;
  age: string;
  gender: string;
  education: string;
  employment: string;
  profession: string;
  challenges: string[];
  focusDuration: string;
  sleepQuality: string;
  stressLevel: string;
}

interface ProductRec {
  name: string;
  slug: string;
  image: string;
  reason: string;
  price: string;
  match: number;
}

interface Tip {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}

interface AnalysisResult {
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  summary: string;
  profileType: string;
  profileDesc: string;
  products: ProductRec[];
  tips: Tip[];
  dailyRoutine: string[];
}

// ─── Questions ──────────────────────────────────────────────────────────
const QUESTIONS: Record<string, Question[]> = {
  tr: [
    {
      id: "screenTime",
      icon: Smartphone,
      title: "Günde ortalama kaç saat telefonunuza bakıyorsunuz?",
      subtitle: "Ekran süresi ADHD semptomlarını etkileyebilir",
      type: "single",
      options: [
        { value: "1-2", label: "1-2 saat", emoji: "😊" },
        { value: "3-4", label: "3-4 saat", emoji: "😐" },
        { value: "5-6", label: "5-6 saat", emoji: "😟" },
        { value: "7-8", label: "7-8 saat", emoji: "😰" },
        { value: "9+", label: "9+ saat", emoji: "🤯" },
      ],
    },
    {
      id: "age",
      icon: User,
      title: "Yaşınız kaç?",
      subtitle: "ADHD belirtileri yaşa göre farklılık gösterir",
      type: "single",
      options: [
        { value: "13-17", label: "13-17", emoji: "🎒" },
        { value: "18-24", label: "18-24", emoji: "🎓" },
        { value: "25-34", label: "25-34", emoji: "💼" },
        { value: "35-44", label: "35-44", emoji: "🏠" },
        { value: "45+", label: "45+", emoji: "🌟" },
      ],
    },
    {
      id: "gender",
      icon: Heart,
      title: "Cinsiyetiniz nedir?",
      subtitle: "ADHD kadınlarda ve erkeklerde farklı şekilde görülür",
      type: "single",
      options: [
        { value: "male", label: "Erkek", emoji: "👨" },
        { value: "female", label: "Kadın", emoji: "👩" },
        { value: "other", label: "Diğer / Belirtmek istemiyorum", emoji: "🌈" },
      ],
    },
    {
      id: "education",
      icon: GraduationCap,
      title: "Öğrenim durumunuz nedir?",
      subtitle: "Eğitim ortamı ADHD yönetiminde önemli bir faktördür",
      type: "single",
      options: [
        { value: "highschool", label: "Lise", emoji: "📚" },
        { value: "university", label: "Üniversite", emoji: "🎓" },
        { value: "masters", label: "Yüksek Lisans", emoji: "📖" },
        { value: "phd", label: "Doktora", emoji: "🔬" },
        { value: "other", label: "Diğer", emoji: "📝" },
      ],
    },
    {
      id: "employment",
      icon: Briefcase,
      title: "Çalışma durumunuz nedir?",
      subtitle: "İş hayatı ve ADHD yönetimi birlikte değerlendirilir",
      type: "single",
      options: [
        { value: "student", label: "Öğrenci", emoji: "📚" },
        { value: "employed", label: "Çalışan", emoji: "💼" },
        { value: "freelance", label: "Serbest Çalışan", emoji: "🏠" },
        { value: "unemployed", label: "İş Arıyor", emoji: "🔍" },
        { value: "entrepreneur", label: "Girişimci", emoji: "🚀" },
      ],
    },
    {
      id: "profession",
      icon: Target,
      title: "Mesleğiniz veya alanınız nedir?",
      subtitle: "Meslek grubuna özel öneriler sunacağız",
      type: "single",
      options: [
        { value: "engineering", label: "Mühendislik / Teknoloji", emoji: "⚙️" },
        { value: "health", label: "Sağlık", emoji: "🏥" },
        { value: "education", label: "Eğitim", emoji: "📖" },
        { value: "creative", label: "Yaratıcı (Tasarım, Sanat, Müzik)", emoji: "🎨" },
        { value: "business", label: "İş / Finans", emoji: "📊" },
        { value: "student_field", label: "Hâlâ öğrenci", emoji: "🎒" },
        { value: "other", label: "Diğer", emoji: "🌐" },
      ],
    },
    {
      id: "challenges",
      icon: AlertTriangle,
      title: "En çok hangi konularda zorlanıyorsunuz?",
      subtitle: "Birden fazla seçebilirsiniz",
      type: "multi",
      options: [
        { value: "focus", label: "Odaklanma güçlüğü", emoji: "🎯" },
        { value: "time", label: "Zaman yönetimi", emoji: "⏰" },
        { value: "organization", label: "Organizasyon / düzen", emoji: "📋" },
        { value: "procrastination", label: "Erteleme alışkanlığı", emoji: "😴" },
        { value: "hyperactivity", label: "Yerinde duramama", emoji: "⚡" },
        { value: "sleep", label: "Uyku düzensizliği", emoji: "🌙" },
        { value: "anxiety", label: "Kaygı / stres", emoji: "😰" },
        { value: "memory", label: "Unutkanlık", emoji: "🧠" },
        { value: "motivation", label: "Motivasyon eksikliği", emoji: "📉" },
        { value: "social", label: "Sosyal ilişki zorlukları", emoji: "👥" },
      ],
    },
    {
      id: "focusDuration",
      icon: Clock,
      title: "Kesintisiz ne kadar odaklanabiliyorsunuz?",
      subtitle: "Tek bir göreve kesintisiz odaklanma süreniz",
      type: "single",
      options: [
        { value: "5min", label: "5 dakikadan az", emoji: "😵" },
        { value: "5-15", label: "5-15 dakika", emoji: "😟" },
        { value: "15-30", label: "15-30 dakika", emoji: "😐" },
        { value: "30-60", label: "30-60 dakika", emoji: "🙂" },
        { value: "60+", label: "1 saatten fazla", emoji: "💪" },
      ],
    },
    {
      id: "sleepQuality",
      icon: Moon,
      title: "Uyku kalitenizi nasıl değerlendirirsiniz?",
      subtitle: "Uyku kalitesi ADHD semptomlarını doğrudan etkiler",
      type: "single",
      options: [
        { value: "very_bad", label: "Çok kötü - sürekli uyanıyorum", emoji: "😫" },
        { value: "bad", label: "Kötü - uyumakta zorlanıyorum", emoji: "😴" },
        { value: "average", label: "Orta - bazen sorun yaşıyorum", emoji: "😐" },
        { value: "good", label: "İyi - genellikle rahat uyuyorum", emoji: "🙂" },
        { value: "very_good", label: "Çok iyi", emoji: "😊" },
      ],
    },
    {
      id: "stressLevel",
      icon: Zap,
      title: "Genel stres seviyeniz nasıl?",
      subtitle: "Stres ADHD semptomlarını şiddetlendirebilir",
      type: "single",
      options: [
        { value: "very_high", label: "Çok yüksek", emoji: "🔴" },
        { value: "high", label: "Yüksek", emoji: "🟠" },
        { value: "moderate", label: "Orta", emoji: "🟡" },
        { value: "low", label: "Düşük", emoji: "🟢" },
        { value: "very_low", label: "Çok düşük", emoji: "💚" },
      ],
    },
  ],
  en: [
    {
      id: "screenTime",
      icon: Smartphone,
      title: "How many hours per day do you look at your phone?",
      subtitle: "Screen time can affect ADHD symptoms",
      type: "single",
      options: [
        { value: "1-2", label: "1-2 hours", emoji: "😊" },
        { value: "3-4", label: "3-4 hours", emoji: "😐" },
        { value: "5-6", label: "5-6 hours", emoji: "😟" },
        { value: "7-8", label: "7-8 hours", emoji: "😰" },
        { value: "9+", label: "9+ hours", emoji: "🤯" },
      ],
    },
    {
      id: "age",
      icon: User,
      title: "How old are you?",
      subtitle: "ADHD symptoms vary by age",
      type: "single",
      options: [
        { value: "13-17", label: "13-17", emoji: "🎒" },
        { value: "18-24", label: "18-24", emoji: "🎓" },
        { value: "25-34", label: "25-34", emoji: "💼" },
        { value: "35-44", label: "35-44", emoji: "🏠" },
        { value: "45+", label: "45+", emoji: "🌟" },
      ],
    },
    {
      id: "gender",
      icon: Heart,
      title: "What is your gender?",
      subtitle: "ADHD manifests differently in men and women",
      type: "single",
      options: [
        { value: "male", label: "Male", emoji: "👨" },
        { value: "female", label: "Female", emoji: "👩" },
        { value: "other", label: "Other / Prefer not to say", emoji: "🌈" },
      ],
    },
    {
      id: "education",
      icon: GraduationCap,
      title: "What is your education level?",
      subtitle: "Educational environment is an important factor in ADHD management",
      type: "single",
      options: [
        { value: "highschool", label: "High School", emoji: "📚" },
        { value: "university", label: "University", emoji: "🎓" },
        { value: "masters", label: "Master's Degree", emoji: "📖" },
        { value: "phd", label: "PhD", emoji: "🔬" },
        { value: "other", label: "Other", emoji: "📝" },
      ],
    },
    {
      id: "employment",
      icon: Briefcase,
      title: "What is your employment status?",
      subtitle: "Work life and ADHD management are evaluated together",
      type: "single",
      options: [
        { value: "student", label: "Student", emoji: "📚" },
        { value: "employed", label: "Employed", emoji: "💼" },
        { value: "freelance", label: "Freelancer", emoji: "🏠" },
        { value: "unemployed", label: "Job Seeking", emoji: "🔍" },
        { value: "entrepreneur", label: "Entrepreneur", emoji: "🚀" },
      ],
    },
    {
      id: "profession",
      icon: Target,
      title: "What is your profession or field?",
      subtitle: "We'll provide profession-specific recommendations",
      type: "single",
      options: [
        { value: "engineering", label: "Engineering / Technology", emoji: "⚙️" },
        { value: "health", label: "Healthcare", emoji: "🏥" },
        { value: "education", label: "Education", emoji: "📖" },
        { value: "creative", label: "Creative (Design, Art, Music)", emoji: "🎨" },
        { value: "business", label: "Business / Finance", emoji: "📊" },
        { value: "student_field", label: "Still a student", emoji: "🎒" },
        { value: "other", label: "Other", emoji: "🌐" },
      ],
    },
    {
      id: "challenges",
      icon: AlertTriangle,
      title: "What do you struggle with the most?",
      subtitle: "You can select multiple options",
      type: "multi",
      options: [
        { value: "focus", label: "Difficulty focusing", emoji: "🎯" },
        { value: "time", label: "Time management", emoji: "⏰" },
        { value: "organization", label: "Organization / tidiness", emoji: "📋" },
        { value: "procrastination", label: "Procrastination", emoji: "😴" },
        { value: "hyperactivity", label: "Can't sit still", emoji: "⚡" },
        { value: "sleep", label: "Sleep irregularity", emoji: "🌙" },
        { value: "anxiety", label: "Anxiety / stress", emoji: "😰" },
        { value: "memory", label: "Forgetfulness", emoji: "🧠" },
        { value: "motivation", label: "Lack of motivation", emoji: "📉" },
        { value: "social", label: "Social relationship difficulties", emoji: "👥" },
      ],
    },
    {
      id: "focusDuration",
      icon: Clock,
      title: "How long can you focus without interruption?",
      subtitle: "Your uninterrupted focus time on a single task",
      type: "single",
      options: [
        { value: "5min", label: "Less than 5 minutes", emoji: "😵" },
        { value: "5-15", label: "5-15 minutes", emoji: "😟" },
        { value: "15-30", label: "15-30 minutes", emoji: "😐" },
        { value: "30-60", label: "30-60 minutes", emoji: "🙂" },
        { value: "60+", label: "More than 1 hour", emoji: "💪" },
      ],
    },
    {
      id: "sleepQuality",
      icon: Moon,
      title: "How would you rate your sleep quality?",
      subtitle: "Sleep quality directly affects ADHD symptoms",
      type: "single",
      options: [
        { value: "very_bad", label: "Very bad - I keep waking up", emoji: "😫" },
        { value: "bad", label: "Bad - I struggle to fall asleep", emoji: "😴" },
        { value: "average", label: "Average - sometimes I have issues", emoji: "😐" },
        { value: "good", label: "Good - I usually sleep well", emoji: "🙂" },
        { value: "very_good", label: "Very good", emoji: "😊" },
      ],
    },
    {
      id: "stressLevel",
      icon: Zap,
      title: "What is your general stress level?",
      subtitle: "Stress can intensify ADHD symptoms",
      type: "single",
      options: [
        { value: "very_high", label: "Very high", emoji: "🔴" },
        { value: "high", label: "High", emoji: "🟠" },
        { value: "moderate", label: "Moderate", emoji: "🟡" },
        { value: "low", label: "Low", emoji: "🟢" },
        { value: "very_low", label: "Very low", emoji: "💚" },
      ],
    },
  ],
};

// ─── Analysis Engine ────────────────────────────────────────────────────
function analyzeProfile(profile: UserProfile, locale: string): AnalysisResult {
  const isTr = locale === "tr";
  let riskScore = 0;

  // Screen time scoring
  const screenScores: Record<string, number> = { "1-2": 0, "3-4": 10, "5-6": 20, "7-8": 30, "9+": 40 };
  riskScore += screenScores[profile.screenTime] || 0;

  // Focus duration scoring
  const focusScores: Record<string, number> = { "5min": 30, "5-15": 20, "15-30": 10, "30-60": 5, "60+": 0 };
  riskScore += focusScores[profile.focusDuration] || 0;

  // Sleep scoring
  const sleepScores: Record<string, number> = { very_bad: 20, bad: 15, average: 8, good: 3, very_good: 0 };
  riskScore += sleepScores[profile.sleepQuality] || 0;

  // Stress scoring
  const stressScores: Record<string, number> = { very_high: 15, high: 10, moderate: 5, low: 2, very_low: 0 };
  riskScore += stressScores[profile.stressLevel] || 0;

  // Challenge count
  riskScore += Math.min(profile.challenges.length * 3, 15);

  const riskLevel: "low" | "moderate" | "high" = riskScore >= 60 ? "high" : riskScore >= 35 ? "moderate" : "low";

  // Profile type
  const isStudent = profile.employment === "student" || profile.profession === "student_field";
  const isYoung = profile.age === "13-17" || profile.age === "18-24";
  const isWorking = profile.employment === "employed" || profile.employment === "freelance" || profile.employment === "entrepreneur";
  const isCreative = profile.profession === "creative";
  const isTech = profile.profession === "engineering";

  let profileType = "";
  let profileDesc = "";

  if (isStudent && isYoung) {
    profileType = isTr ? "Genç Öğrenci Profili" : "Young Student Profile";
    profileDesc = isTr
      ? "Ders çalışma, sınav stresi ve sosyal hayat dengesinde zorlanan genç ADHD profili. Odaklanma araçları ve yapılandırılmış planlama en çok işinize yarayacak."
      : "Young ADHD profile struggling to balance studying, exam stress and social life. Focus tools and structured planning will help you most.";
  } else if (isStudent) {
    profileType = isTr ? "Akademik Profil" : "Academic Profile";
    profileDesc = isTr
      ? "Akademik kariyer hedefleyen, yoğun okuma ve araştırma gerektiren bir ADHD profili. Gürültü engelleme ve zaman yönetimi araçları kritik."
      : "ADHD profile targeting academic career, requiring intensive reading and research. Noise cancellation and time management tools are critical.";
  } else if (isTech && isWorking) {
    profileType = isTr ? "Teknoloji Profesyoneli" : "Tech Professional";
    profileDesc = isTr
      ? "Ekran başında uzun saatler geçiren, multitasking gerektiren bir ADHD profili. Mavi ışık koruması, masa düzeni ve Pomodoro tekniği odak noktanız olmalı."
      : "ADHD profile spending long hours at screen with multitasking demands. Blue light protection, desk organization and Pomodoro technique should be your focus.";
  } else if (isCreative) {
    profileType = isTr ? "Yaratıcı Profil" : "Creative Profile";
    profileDesc = isTr
      ? "Hiperfokus dönemlerini verimli kullanabilen ama rutin işlerde zorlanan yaratıcı ADHD profili. Yapı sağlayan ama esneklik tanıyan araçlar ideal."
      : "Creative ADHD profile that can use hyperfocus periods productively but struggles with routine tasks. Tools that provide structure but allow flexibility are ideal.";
  } else if (isWorking) {
    profileType = isTr ? "Çalışan Profesyonel" : "Working Professional";
    profileDesc = isTr
      ? "İş yerinde performans baskısı yaşayan, toplantı ve deadline'larla boğuşan ADHD profili. Organizasyon ve stres yönetimi araçları önceliğiniz."
      : "ADHD profile experiencing performance pressure at work, dealing with meetings and deadlines. Organization and stress management tools are your priority.";
  } else {
    profileType = isTr ? "Genel Profil" : "General Profile";
    profileDesc = isTr
      ? "Günlük yaşamda ADHD semptomlarıyla başa çıkmaya çalışan profil. Odaklanma, organizasyon ve stres yönetimi araçları faydalı olacaktır."
      : "Profile trying to cope with ADHD symptoms in daily life. Focus, organization and stress management tools will be helpful.";
  }

  // Product recommendations based on profile
  const products: ProductRec[] = [];
  const challenges = profile.challenges;

  if (challenges.includes("focus") || challenges.includes("procrastination")) {
    products.push({
      name: isTr ? "Focus Timer - Pomodoro Zamanlayıcı" : "Focus Timer - Pomodoro Timer",
      slug: "focus-timer-pomodoro",
      image: "/products/pomodoro-timer.png",
      reason: isTr ? "Odaklanma sürenizi artırmak için bilimsel Pomodoro tekniği" : "Scientific Pomodoro technique to increase your focus time",
      price: isTr ? "₺299.90" : "$17.99",
      match: 95,
    });
  }

  if (challenges.includes("hyperactivity") || challenges.includes("anxiety")) {
    if (isStudent || isYoung) {
      products.push({
        name: isTr ? "Fidget Ring Set - 4'lü Stres Yüzüğü" : "Fidget Ring Set - 4 Pack",
        slug: "fidget-ring-set",
        image: "/products/fidget-rings.png",
        reason: isTr ? "Derste/sınavda sessizce kullanılabilir, stres ve hiperaktiviteyi azaltır" : "Can be used silently in class/exams, reduces stress and hyperactivity",
        price: isTr ? "₺129.90" : "$7.99",
        match: 92,
      });
    }
    products.push({
      name: isTr ? "Fidget Cube - 6 Yüzlü Stres Küpü" : "Fidget Cube - 6-Sided",
      slug: "fidget-cube-stres-kupu",
      image: "/products/fidget-cube.png",
      reason: isTr ? "Ellerinizi meşgul tutarak hiperaktiviteyi kanalize eder" : "Channels hyperactivity by keeping your hands busy",
      price: isTr ? "₺149.90" : "$8.99",
      match: 88,
    });
  }

  if (challenges.includes("time") || challenges.includes("organization")) {
    products.push({
      name: isTr ? "ADHD Focus Planner" : "ADHD Focus Planner",
      slug: "adhd-focus-planner",
      image: "/products/focus-planner.png",
      reason: isTr ? "ADHD beyni için özel tasarlanmış zaman blokları ve öncelik matrisi" : "Time blocks and priority matrix designed for the ADHD brain",
      price: isTr ? "₺349.90" : "$19.99",
      match: 93,
    });
  }

  if (challenges.includes("organization") || (isTech && isWorking)) {
    products.push({
      name: isTr ? "Bambu Masa Düzenleyici" : "Bamboo Desk Organizer",
      slug: "bambu-masa-duzenleyici",
      image: "/products/desk-organizer.png",
      reason: isTr ? "Dağınık masa görsel stresi artırır. Düzen = odaklanma" : "Messy desk increases visual stress. Order = focus",
      price: isTr ? "₺449.90" : "$24.99",
      match: 85,
    });
  }

  if (challenges.includes("focus") && (isTech || isWorking || profile.screenTime === "7-8" || profile.screenTime === "9+")) {
    products.push({
      name: isTr ? "ANC Gürültü Engelleyici Kulaklık" : "ANC Noise Cancelling Earbuds",
      slug: "anc-gurultu-engelleyici-kulaklik",
      image: "/products/noise-cancel-earbuds.png",
      reason: isTr ? "Yüksek ekran süresi + açık ofis = gürültü engelleyici şart" : "High screen time + open office = noise cancelling essential",
      price: isTr ? "₺599.90" : "$34.99",
      match: 90,
    });
  }

  if (challenges.includes("sleep") || profile.sleepQuality === "very_bad" || profile.sleepQuality === "bad") {
    products.push({
      name: isTr ? "Beyaz Gürültü Makinesi" : "White Noise Machine",
      slug: "beyaz-gurultu-makinesi",
      image: "/products/white-noise-machine.png",
      reason: isTr ? "Uyku düzensizliğiniz için beyaz gürültü melatonin üretimini destekler" : "White noise supports melatonin production for your sleep irregularity",
      price: isTr ? "₺399.90" : "$22.99",
      match: 91,
    });
    products.push({
      name: isTr ? "Mavi Işık Filtreli Gözlük" : "Blue Light Blocking Glasses",
      slug: "mavi-isik-filtreli-gozluk",
      image: "/products/blue-light-glasses.png",
      reason: isTr ? "Ekranın mavi ışığı uykunuzu bozuyor. Bu gözlük melatonini korur" : "Screen blue light disrupts sleep. These glasses protect melatonin",
      price: isTr ? "₺199.90" : "$11.99",
      match: 87,
    });
  }

  if (profile.screenTime === "7-8" || profile.screenTime === "9+") {
    const hasGlasses = products.some((p) => p.slug === "mavi-isik-filtreli-gozluk");
    if (!hasGlasses) {
      products.push({
        name: isTr ? "Mavi Işık Filtreli Gözlük" : "Blue Light Blocking Glasses",
        slug: "mavi-isik-filtreli-gozluk",
        image: "/products/blue-light-glasses.png",
        reason: isTr ? "Günde " + profile.screenTime + " saat ekran süresi var. Gözlerinizi koruyun" : profile.screenTime + " hrs/day screen time. Protect your eyes",
        price: isTr ? "₺199.90" : "$11.99",
        match: 86,
      });
    }
  }

  // If no products matched (unlikely), add defaults
  if (products.length === 0) {
    products.push(
      { name: isTr ? "Fidget Cube" : "Fidget Cube", slug: "fidget-cube-stres-kupu", image: "/products/fidget-cube.png", reason: isTr ? "Genel stres yönetimi için" : "For general stress management", price: isTr ? "₺149.90" : "$8.99", match: 75 },
      { name: isTr ? "Focus Planner" : "Focus Planner", slug: "adhd-focus-planner", image: "/products/focus-planner.png", reason: isTr ? "Günlük yapınızı kurmak için" : "To build your daily structure", price: isTr ? "₺349.90" : "$19.99", match: 70 },
    );
  }

  products.sort((a, b) => b.match - a.match);

  // Tips based on profile
  const tips: Tip[] = [];

  if (challenges.includes("focus")) {
    tips.push({
      icon: Target,
      title: isTr ? "Pomodoro Tekniği Uygulayın" : "Apply Pomodoro Technique",
      desc: isTr
        ? "25 dakika odaklanma + 5 dakika mola döngüsü. 4 döngüden sonra 15-30 dk uzun mola. ADHD beyni için en etkili yöntem."
        : "25 min focus + 5 min break cycle. After 4 cycles, 15-30 min long break. Most effective method for ADHD brain.",
      color: "from-blue-500 to-indigo-600",
    });
  }

  if (challenges.includes("sleep") || profile.sleepQuality === "very_bad" || profile.sleepQuality === "bad") {
    tips.push({
      icon: Moon,
      title: isTr ? "Uyku Hijyeni Kuralları" : "Sleep Hygiene Rules",
      desc: isTr
        ? "Yatmadan 2 saat önce ekranları kapatın. Beyaz gürültü kullanın. Her gün aynı saatte yatın/kalkın."
        : "Turn off screens 2 hours before bed. Use white noise. Go to bed/wake up at the same time every day.",
      color: "from-purple-500 to-pink-600",
    });
  }

  if (challenges.includes("time") || challenges.includes("procrastination")) {
    tips.push({
      icon: Clock,
      title: isTr ? "2 Dakika Kuralı" : "2 Minute Rule",
      desc: isTr
        ? "2 dakikadan az sürecek işleri hemen yapın. Erteleme döngüsünü kırmak için güçlü bir teknik."
        : "Do tasks that take less than 2 minutes immediately. A powerful technique to break the procrastination cycle.",
      color: "from-orange-500 to-red-600",
    });
  }

  if (challenges.includes("organization")) {
    tips.push({
      icon: BookOpen,
      title: isTr ? "Her Şeyin Bir Yeri Olsun" : "A Place for Everything",
      desc: isTr
        ? "Dağınıklık ADHD'nin en büyük düşmanı. Her eşyaya sabit bir yer belirleyin ve her kullanımdan sonra yerine koyun."
        : "Clutter is ADHD's biggest enemy. Assign a fixed place for each item and put it back after each use.",
      color: "from-green-500 to-emerald-600",
    });
  }

  if (profile.screenTime === "7-8" || profile.screenTime === "9+") {
    tips.push({
      icon: Smartphone,
      title: isTr ? "Dijital Detoks Saatleri" : "Digital Detox Hours",
      desc: isTr
        ? "Günde " + profile.screenTime + " saat ekran süresi çok yüksek. Sabah ilk 1 saat ve akşam son 2 saat ekrandan uzak durun."
        : profile.screenTime + " hrs screen time is very high. Stay away from screens for the first hour in the morning and last 2 hours at night.",
      color: "from-red-500 to-rose-600",
    });
  }

  if (challenges.includes("anxiety") || profile.stressLevel === "very_high" || profile.stressLevel === "high") {
    tips.push({
      icon: Heart,
      title: isTr ? "4-7-8 Nefes Tekniği" : "4-7-8 Breathing Technique",
      desc: isTr
        ? "4 saniye nefes alın, 7 saniye tutun, 8 saniye verin. Günde 3 kez uygulayın. Anksiyeteyi hızla düşürür."
        : "Inhale 4 seconds, hold 7 seconds, exhale 8 seconds. Apply 3 times a day. Rapidly reduces anxiety.",
      color: "from-pink-500 to-rose-600",
    });
  }

  tips.push({
    icon: Coffee,
    title: isTr ? "Egzersiz Yapın" : "Exercise",
    desc: isTr
      ? "Günde en az 30 dakika yürüyüş veya spor. Egzersiz doğal dopamin üretimini artırarak ADHD semptomlarını hafifletir."
      : "At least 30 minutes of walking or exercise daily. Exercise increases natural dopamine production, alleviating ADHD symptoms.",
    color: "from-teal-500 to-cyan-600",
  });

  // Daily routine suggestion
  const dailyRoutine = isTr
    ? [
        "07:00 - Uyan, telefona bakma, 5 dk nefes egzersizi",
        "07:15 - Duş + kahvaltı (rutini sabitle)",
        "08:00 - En zor görevi yap (beyin en taze bu saatte)",
        "08:25 - 5 dk mola (Pomodoro)",
        "10:00 - Orta zorluktaki görevler",
        "12:00 - Öğle yemeği + 15 dk yürüyüş",
        "13:00 - Yaratıcı/sosyal görevler",
        "15:00 - Hafif görevler (enerji düşer)",
        "17:00 - Egzersiz / spor",
        "19:00 - Akşam yemeği + dinlenme",
        "21:00 - Ekranları kapat, kitap oku / müzik dinle",
        "22:30 - Beyaz gürültü ile uyu",
      ]
    : [
        "07:00 - Wake up, don't check phone, 5 min breathing exercise",
        "07:15 - Shower + breakfast (keep routine fixed)",
        "08:00 - Do hardest task (brain is freshest now)",
        "08:25 - 5 min break (Pomodoro)",
        "10:00 - Medium difficulty tasks",
        "12:00 - Lunch + 15 min walk",
        "13:00 - Creative/social tasks",
        "15:00 - Light tasks (energy drops)",
        "17:00 - Exercise / sports",
        "19:00 - Dinner + rest",
        "21:00 - Turn off screens, read / listen to music",
        "22:30 - Sleep with white noise",
      ];

  const summary = isTr
    ? riskLevel === "high"
      ? "Değerlendirme sonuçlarınız yüksek düzeyde ADHD semptomları göstermektedir. Bir uzmana danışmanızı önemle öneriyoruz. Aşağıdaki ürün ve öneriler günlük yaşamınızı kolaylaştıracaktır."
      : riskLevel === "moderate"
        ? "Orta düzeyde ADHD semptomları tespit edildi. Doğru araçlar ve stratejilerle günlük yaşam kalitesini önemli ölçüde artırabilirsiniz."
        : "Düşük düzeyde ADHD semptomları gösteriyorsunuz. Bazı odaklanma ve organizasyon ipuçları faydalı olabilir."
    : riskLevel === "high"
      ? "Your assessment results indicate high-level ADHD symptoms. We strongly recommend consulting a specialist. The products and tips below will make your daily life easier."
      : riskLevel === "moderate"
        ? "Moderate level ADHD symptoms detected. With the right tools and strategies, you can significantly improve your quality of daily life."
        : "You show low-level ADHD symptoms. Some focus and organization tips may be helpful.";

  return {
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    summary,
    profileType,
    profileDesc,
    products: products.slice(0, 6),
    tips,
    dailyRoutine,
  };
}

// ─── Component ──────────────────────────────────────────────────────────
export default function AssessmentPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const isTr = locale === "tr";

  const [step, setStep] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const questions = QUESTIONS[locale] || QUESTIONS.tr;
  const totalSteps = questions.length;
  const currentQ = step >= 0 && step < totalSteps ? questions[step] : null;

  const handleSelect = (value: string) => {
    if (!currentQ) return;
    if (currentQ.type === "multi") {
      const prev = (answers[currentQ.id] as string[]) || [];
      const updated = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: value });
      // Auto-advance for single
      setTimeout(() => {
        if (step < totalSteps - 1) {
          setStep(step + 1);
        }
      }, 300);
    }
  };

  const canProceed = () => {
    if (!currentQ) return false;
    const answer = answers[currentQ.id];
    if (currentQ.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return !!answer;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      runAnalysis();
    }
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    // Fake analysis delay for UX
    setTimeout(() => {
      const profile: UserProfile = {
        screenTime: (answers.screenTime as string) || "",
        age: (answers.age as string) || "",
        gender: (answers.gender as string) || "",
        education: (answers.education as string) || "",
        employment: (answers.employment as string) || "",
        profession: (answers.profession as string) || "",
        challenges: (answers.challenges as string[]) || [],
        focusDuration: (answers.focusDuration as string) || "",
        sleepQuality: (answers.sleepQuality as string) || "",
        stressLevel: (answers.stressLevel as string) || "",
      };
      setResult(analyzeProfile(profile, locale));
      setIsAnalyzing(false);
      setStep(totalSteps);
    }, 2500);
  };

  // ─── INTRO SCREEN ──────────────────────────────────────────────────
  if (step === -1) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4 bg-[#E0E7D7] relative overflow-hidden">
        <div className="max-w-lg w-full text-center relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-[#5a7a52] mx-auto mb-6 flex items-center justify-center">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2d3a2a] mb-4 italic font-serif">
            {isTr ? "Dopamind ADHD Değerlendirme" : "Dopamind ADHD Assessment"}
          </h1>
          <p className="text-gray-600 mb-3 leading-relaxed">
            {isTr
              ? "10 kısa soruyla profilinizi analiz edip size özel ürün ve strateji önerileri sunacağız."
              : "We'll analyze your profile with 10 short questions and provide personalized product and strategy recommendations."}
          </p>
          <p className="text-xs text-gray-400 mb-8 font-mono uppercase tracking-widest">
            {isTr
              ? "⚠️ Bu değerlendirme tıbbi bir teşhis değildir. Profesyonel değerlendirme için bir uzmana başvurun."
              : "⚠️ This assessment is not a medical diagnosis. Consult a specialist for professional evaluation."}
          </p>
          <button
            onClick={() => setStep(0)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#5a7a52] text-white font-semibold hover:bg-[#4a6a44] transition-all text-lg"
          >
            {isTr ? "Değerlendirmeye Başla" : "Start Assessment"}
            <ArrowRight className="w-5 h-5 text-white/90" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400 font-mono uppercase tracking-widest">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-500" /> {isTr ? "~3 dakika" : "~3 minutes"}</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-gray-500" /> {isTr ? "Anonim" : "Anonymous"}</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── ANALYZING SCREEN ─────────────────────────────────────────────
  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#E0E7D7] pt-24">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-[#5a7a52] border-t-transparent animate-spin" />
            <Brain className="absolute inset-0 m-auto w-10 h-10 text-[#5a7a52]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2d3a2a] mb-2 italic font-serif">
            {isTr ? "Profiliniz Analiz Ediliyor..." : "Analyzing Your Profile..."}
          </h2>
          <p className="text-gray-600">
            {isTr ? "Yanıtlarınıza göre kişisel öneriler hazırlanıyor" : "Preparing personal recommendations based on your answers"}
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ───────────────────────────────────────────────
  if (result && step >= totalSteps) {
    const riskColors = { low: "text-[#5a7a52] bg-[#5a7a52]/10 border-[#5a7a52]/30", moderate: "text-amber-600 bg-amber-500/10 border-amber-500/30", high: "text-[#5a7a52] bg-[#5a7a52]/10 border-[#5a7a52]/30" };
    const riskLabels = { low: isTr ? "Düşük" : "Low", moderate: isTr ? "Orta" : "Moderate", high: isTr ? "Yüksek" : "High" };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 bg-[#E0E7D7] min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5a7a52]/10 text-[#5a7a52] text-sm font-medium mb-4 font-mono uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#5a7a52]" />
            {isTr ? "Kişisel Analiz Sonucu" : "Personal Analysis Result"}
          </div>
          <h1 className="text-3xl font-bold text-[#2d3a2a] mb-2 italic font-serif">{result.profileType}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{result.profileDesc}</p>
        </div>

        {/* Risk Score */}
        <div className={`p-6 rounded-2xl border shadow-sm bg-white/70 backdrop-blur-sm ${riskColors[result.riskLevel]} mb-8`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#2d3a2a]">
              {isTr ? "ADHD Belirti Seviyesi" : "ADHD Symptom Level"}: {riskLabels[result.riskLevel]}
            </h3>
            <span className="text-2xl font-bold text-[#2d3a2a]">{result.riskScore}/100</span>
          </div>
          <div className="w-full h-3 bg-[#E0E7D7]/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5a7a52] rounded-full transition-all duration-1000"
              style={{ width: `${result.riskScore}%` }}
            />
          </div>
          <p className="text-sm mt-3 text-gray-600">{result.summary}</p>
        </div>

        {/* Recommended Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#2d3a2a] mb-2 italic font-serif">
            {isTr ? "Size Özel Ürün Önerileri" : "Personalized Product Recommendations"}
          </h2>
          <p className="text-gray-600 mb-6">
            {isTr ? "Profilinize göre en çok fayda sağlayacak ürünler" : "Products that will benefit you the most based on your profile"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.products.map((product) => (
              <Link
                key={product.slug}
                href={`/${locale}/products/${product.slug}`}
                className="group p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30 hover:border-[#5a7a52]/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#E0E7D7]/40 flex-shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#5a7a52] bg-[#5a7a52]/10 px-2 py-0.5 rounded-md">
                        {product.match}% {isTr ? "eşleşme" : "match"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#2d3a2a] text-sm group-hover:text-[#5a7a52] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.reason}</p>
                    <p className="text-sm font-bold text-[#2d3a2a] mt-2">{product.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tips & Strategies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#2d3a2a] mb-6 italic font-serif">
            {isTr ? "Kişisel Strateji Önerileri" : "Personal Strategy Recommendations"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.tips.map((tip) => (
              <div key={tip.title} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30 transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center mb-4`}>
                  <tip.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#2d3a2a] mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Routine */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#2d3a2a] mb-6 italic font-serif">
            {isTr ? "Önerilen Günlük Rutin" : "Recommended Daily Routine"}
          </h2>
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
            <div className="space-y-3">
              {result.dailyRoutine.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5a7a52]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#5a7a52] text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800/90">
              {isTr
                ? "Bu değerlendirme bilgilendirme amaçlıdır ve tıbbi bir teşhis yerine geçmez. ADHD teşhisi için mutlaka bir psikiyatrist veya klinik psikologa başvurun."
                : "This assessment is for informational purposes and does not replace a medical diagnosis. Be sure to consult a psychiatrist or clinical psychologist for an ADHD diagnosis."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#5a7a52] text-white font-semibold hover:bg-[#4a6a44] transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-white/90" />
            {isTr ? "Tüm Ürünleri Gör" : "See All Products"}
          </Link>
          <button
            onClick={() => { setStep(-1); setAnswers({}); setResult(null); }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-gray-500" />
            {isTr ? "Tekrar Değerlendir" : "Retake Assessment"}
          </button>
        </div>
      </div>
    );
  }

  // ─── QUESTION SCREEN ──────────────────────────────────────────────
  const progress = ((step + 1) / totalSteps) * 100;
  const isMulti = currentQ?.type === "multi";
  const selectedValue = currentQ ? answers[currentQ.id] : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#E0E7D7] pt-24">
      {/* Progress Bar */}
      <div className="sticky top-24 z-40 bg-[#E0E7D7] border-b border-[#B7C396]/30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2 font-mono uppercase tracking-widest">
            <span>{isTr ? `Soru ${step + 1} / ${totalSteps}` : `Question ${step + 1} / ${totalSteps}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5a7a52] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full">
          {currentQ && (
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#5a7a52]/10 mx-auto mb-4 flex items-center justify-center">
                <currentQ.icon className="w-7 h-7 text-[#5a7a52]" />
              </div>
              <h2 className="text-2xl font-bold text-[#2d3a2a] mb-2 italic font-serif">{currentQ.title}</h2>
              <p className="text-gray-600">{currentQ.subtitle}</p>
              {isMulti && (
                <p className="text-xs text-[#5a7a52] mt-2 font-medium font-mono uppercase tracking-widest">
                  {isTr ? "Birden fazla seçebilirsiniz" : "You can select multiple"}
                </p>
              )}
            </div>
          )}

          {/* Options */}
          <div className={`grid gap-3 ${currentQ?.options && currentQ.options.length > 5 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
            {currentQ?.options?.map((opt) => {
              const isSelected = isMulti
                ? Array.isArray(selectedValue) && selectedValue.includes(opt.value)
                : selectedValue === opt.value;

              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-[#5a7a52] bg-[#5a7a52]/5"
                      : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
                  }`}
                >
                  {isMulti && (
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "border-[#5a7a52] bg-[#5a7a52]" : "border-gray-300"
                    }`}>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                  )}
                  {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                  <span className={`font-medium ${isSelected ? "text-[#5a7a52]" : "text-gray-600"}`}>
                    {opt.label}
                  </span>
                  {!isMulti && isSelected && (
                    <CheckCircle className="w-5 h-5 text-[#5a7a52] ml-auto" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(-1, step - 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-gray-500 hover:text-gray-600 hover:bg-white hover:border-gray-200 border border-transparent transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
              {isTr ? "Geri" : "Back"}
            </button>

            {(isMulti || step === totalSteps - 1) && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  canProceed()
                    ? "bg-[#5a7a52] text-white hover:bg-[#4a6a44]"
                    : "bg-white text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
              >
                {step === totalSteps - 1
                  ? isTr ? "Analiz Et" : "Analyze"
                  : isTr ? "Devam" : "Continue"
                }
                <ArrowRight className={`w-4 h-4 ${canProceed() ? "text-white/90" : "text-gray-400"}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
