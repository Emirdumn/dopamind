"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
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
  MessageCircle,
  Send,
  X,
  Activity,
  Frown,
  Users,
  Edit3,
  type LucideIcon,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────
interface QuestionOption {
  value: string;
  label: string;
  emoji?: string;
}

interface Question {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  type: "single" | "multi" | "scale" | "text";
  options?: QuestionOption[];
  hasOther?: boolean;
  otherPlaceholder?: string;
  min?: number;
  max?: number;
  scaleLabels?: { left: string; right: string };
  category?: string;
  clinicalKey?: string;
  condition?: (answers: Record<string, unknown>) => boolean;
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
  [key: string]: string | string[];
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
  icon: LucideIcon;
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
  subscores?: Record<string, number>;
}

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

// ─── Clinical Questions ─────────────────────────────────────────────────
// Phase 1: Basic demographics (always shown)
// Phase 2: Clinical scales (age-dependent)
// Phase 3: Final questions

function getQuestions(locale: string, age?: string): Question[] {
  const isTr = locale === "tr";
  const isChild = age === "13-17";
  const isAdult = age && age !== "13-17";

  const base: Question[] = [
    // ── PHASE 1: Demographics ──
    {
      id: "age",
      icon: User,
      title: isTr ? "Yaşınız kaç?" : "How old are you?",
      subtitle: isTr ? "DEHB belirtileri yaşa göre farklılık gösterir" : "ADHD symptoms vary by age",
      type: "single",
      category: "demographic",
      options: [
        { value: "13-17", label: isTr ? "13-17" : "13-17", emoji: "🎒" },
        { value: "18-24", label: isTr ? "18-24" : "18-24", emoji: "🎓" },
        { value: "25-34", label: isTr ? "25-34" : "25-34", emoji: "💼" },
        { value: "35-44", label: isTr ? "35-44" : "35-44", emoji: "🏠" },
        { value: "45+", label: isTr ? "45+" : "45+", emoji: "🌟" },
      ],
    },
    {
      id: "gender",
      icon: Heart,
      title: isTr ? "Cinsiyetiniz nedir?" : "What is your gender?",
      subtitle: isTr ? "DEHB kadınlarda ve erkeklerde farklı şekilde görülür" : "ADHD manifests differently in men and women",
      type: "single",
      category: "demographic",
      options: [
        { value: "male", label: isTr ? "Erkek" : "Male", emoji: "👨" },
        { value: "female", label: isTr ? "Kadın" : "Female", emoji: "👩" },
        { value: "other", label: isTr ? "Diğer / Belirtmek istemiyorum" : "Other / Prefer not to say", emoji: "🌈" },
      ],
    },
    {
      id: "education",
      icon: GraduationCap,
      title: isTr ? "Öğrenim durumunuz nedir?" : "What is your education level?",
      subtitle: isTr ? "Eğitim ortamı DEHB yönetiminde önemli bir faktördür" : "Educational environment is key in ADHD management",
      type: "single",
      category: "demographic",
      options: [
        { value: "highschool", label: isTr ? "Lise" : "High School", emoji: "📚" },
        { value: "university", label: isTr ? "Üniversite" : "University", emoji: "🎓" },
        { value: "masters", label: isTr ? "Yüksek Lisans" : "Master's Degree", emoji: "📖" },
        { value: "phd", label: isTr ? "Doktora" : "PhD", emoji: "🔬" },
        { value: "other", label: isTr ? "Diğer" : "Other", emoji: "📝" },
      ],
      hasOther: true,
      otherPlaceholder: isTr ? "Öğrenim durumunuzu yazın..." : "Enter your education...",
    },
    {
      id: "employment",
      icon: Briefcase,
      title: isTr ? "Çalışma durumunuz nedir?" : "What is your employment status?",
      subtitle: isTr ? "İş hayatı ve DEHB yönetimi birlikte değerlendirilir" : "Work life and ADHD management are evaluated together",
      type: "single",
      category: "demographic",
      options: [
        { value: "student", label: isTr ? "Öğrenci" : "Student", emoji: "📚" },
        { value: "employed", label: isTr ? "Çalışan" : "Employed", emoji: "💼" },
        { value: "freelance", label: isTr ? "Serbest Çalışan" : "Freelancer", emoji: "🏠" },
        { value: "unemployed", label: isTr ? "İş Arıyor" : "Job Seeking", emoji: "🔍" },
        { value: "entrepreneur", label: isTr ? "Girişimci" : "Entrepreneur", emoji: "🚀" },
        { value: "other", label: isTr ? "Diğer" : "Other", emoji: "✏️" },
      ],
      hasOther: true,
      otherPlaceholder: isTr ? "Çalışma durumunuzu yazın..." : "Enter your employment status...",
    },
    {
      id: "profession",
      icon: Target,
      title: isTr ? "Mesleğiniz veya alanınız nedir?" : "What is your profession or field?",
      subtitle: isTr ? "Meslek grubuna özel öneriler sunacağız" : "We'll provide profession-specific recommendations",
      type: "single",
      category: "demographic",
      options: [
        { value: "engineering", label: isTr ? "Mühendislik / Teknoloji" : "Engineering / Technology", emoji: "⚙️" },
        { value: "health", label: isTr ? "Sağlık" : "Healthcare", emoji: "🏥" },
        { value: "education", label: isTr ? "Eğitim" : "Education", emoji: "📖" },
        { value: "creative", label: isTr ? "Yaratıcı (Tasarım, Sanat, Müzik)" : "Creative (Design, Art, Music)", emoji: "🎨" },
        { value: "business", label: isTr ? "İş / Finans" : "Business / Finance", emoji: "📊" },
        { value: "student_field", label: isTr ? "Hâlâ öğrenci" : "Still a student", emoji: "🎒" },
        { value: "other", label: isTr ? "Diğer" : "Other", emoji: "🌐" },
      ],
      hasOther: true,
      otherPlaceholder: isTr ? "Mesleğinizi yazın..." : "Enter your profession...",
    },

    // ── PHASE 2: Core symptom questions ──
    {
      id: "screenTime",
      icon: Smartphone,
      title: isTr ? "Günde ortalama kaç saat ekran başındasınız?" : "How many hours per day are you on screens?",
      subtitle: isTr ? "Ekran süresi dikkat ve uyku düzenini etkiler" : "Screen time affects attention and sleep patterns",
      type: "single",
      category: "lifestyle",
      options: [
        { value: "1-2", label: isTr ? "1-2 saat" : "1-2 hours", emoji: "😊" },
        { value: "3-4", label: isTr ? "3-4 saat" : "3-4 hours", emoji: "😐" },
        { value: "5-6", label: isTr ? "5-6 saat" : "5-6 hours", emoji: "😟" },
        { value: "7-8", label: isTr ? "7-8 saat" : "7-8 hours", emoji: "😰" },
        { value: "9+", label: isTr ? "9+ saat" : "9+ hours", emoji: "🤯" },
      ],
    },
    {
      id: "focusDuration",
      icon: Clock,
      title: isTr ? "Kesintisiz ne kadar süre odaklanabiliyorsunuz?" : "How long can you focus without interruption?",
      subtitle: isTr ? "Tek bir göreve kesintisiz odaklanma süreniz" : "Your uninterrupted focus time on a single task",
      type: "single",
      category: "attention",
      clinicalKey: "focus",
      options: [
        { value: "5min", label: isTr ? "5 dakikadan az" : "Less than 5 minutes", emoji: "😵" },
        { value: "5-15", label: isTr ? "5-15 dakika" : "5-15 minutes", emoji: "😟" },
        { value: "15-30", label: isTr ? "15-30 dakika" : "15-30 minutes", emoji: "😐" },
        { value: "30-60", label: isTr ? "30-60 dakika" : "30-60 minutes", emoji: "🙂" },
        { value: "60+", label: isTr ? "1 saatten fazla" : "More than 1 hour", emoji: "💪" },
      ],
    },
    {
      id: "challenges",
      icon: AlertTriangle,
      title: isTr ? "En çok hangi konularda zorlanıyorsunuz?" : "What do you struggle with the most?",
      subtitle: isTr ? "Birden fazla seçebilirsiniz" : "You can select multiple options",
      type: "multi",
      category: "symptoms",
      options: [
        { value: "focus", label: isTr ? "Odaklanma güçlüğü" : "Difficulty focusing", emoji: "🎯" },
        { value: "time", label: isTr ? "Zaman yönetimi" : "Time management", emoji: "⏰" },
        { value: "organization", label: isTr ? "Organizasyon / düzen" : "Organization / tidiness", emoji: "📋" },
        { value: "procrastination", label: isTr ? "Erteleme alışkanlığı" : "Procrastination", emoji: "😴" },
        { value: "hyperactivity", label: isTr ? "Yerinde duramama / huzursuzluk" : "Restlessness / can't sit still", emoji: "⚡" },
        { value: "sleep", label: isTr ? "Uyku düzensizliği" : "Sleep irregularity", emoji: "🌙" },
        { value: "anxiety", label: isTr ? "Kaygı / stres" : "Anxiety / stress", emoji: "😰" },
        { value: "memory", label: isTr ? "Unutkanlık" : "Forgetfulness", emoji: "🧠" },
        { value: "motivation", label: isTr ? "Motivasyon eksikliği" : "Lack of motivation", emoji: "📉" },
        { value: "social", label: isTr ? "Sosyal ilişki zorlukları" : "Social relationship difficulties", emoji: "👥" },
        { value: "impulse", label: isTr ? "Dürtüsel davranışlar" : "Impulsive behaviors", emoji: "💥" },
        { value: "emotional", label: isTr ? "Duygusal düzensizlik" : "Emotional dysregulation", emoji: "🎭" },
      ],
      hasOther: true,
      otherPlaceholder: isTr ? "Başka zorlandığınız konuları yazın..." : "Describe other challenges...",
    },
  ];

  // ── PHASE 3: Clinical scale questions (age-dependent) ──
  const clinicalQuestions: Question[] = [];

  if (isChild) {
    // SDQ (Strengths & Difficulties Questionnaire) - child version
    clinicalQuestions.push(
      {
        id: "sdq_hyperactivity",
        icon: Zap,
        title: isTr ? "Hareketlilik ve Dikkat" : "Activity and Attention",
        subtitle: isTr ? "Son 6 ayı düşünerek yanıtlayın (SDQ ölçeği)" : "Think about the last 6 months (SDQ scale)",
        type: "multi",
        category: "clinical_sdq",
        options: [
          { value: "restless", label: isTr ? "Sürekli kıpırdanır, yerinde duramaz" : "Constantly fidgets, can't sit still", emoji: "⚡" },
          { value: "distracted", label: isTr ? "Kolay dikkati dağılır, konsantrasyonu zayıf" : "Easily distracted, poor concentration", emoji: "🎯" },
          { value: "thinks_before", label: isTr ? "Bir şey yapmadan önce düşünmez" : "Acts without thinking first", emoji: "💨" },
          { value: "tasks_done", label: isTr ? "Başladığı işi bitiremez" : "Can't finish tasks once started", emoji: "📋" },
          { value: "attention_good", label: isTr ? "Dikkat süresi iyi, görevlerini tamamlar" : "Good attention span, completes tasks", emoji: "✅" },
        ],
      },
      {
        id: "sdq_emotional",
        icon: Frown,
        title: isTr ? "Duygusal Belirtiler" : "Emotional Symptoms",
        subtitle: isTr ? "Duygusal durumunuzu değerlendirin" : "Evaluate your emotional state",
        type: "multi",
        category: "clinical_sdq",
        options: [
          { value: "headaches", label: isTr ? "Sık baş ağrısı, karın ağrısı veya bulantı" : "Frequent headaches, stomach aches or nausea", emoji: "🤕" },
          { value: "worries", label: isTr ? "Çok endişelenir" : "Worries a lot", emoji: "😟" },
          { value: "unhappy", label: isTr ? "Sık sık mutsuz, kederli veya ağlamaklı" : "Often unhappy, sad or tearful", emoji: "😢" },
          { value: "nervous", label: isTr ? "Yeni durumlarda sinirli/güvensiz" : "Nervous/insecure in new situations", emoji: "😰" },
          { value: "fears", label: isTr ? "Çok korkusu var" : "Has many fears", emoji: "😨" },
        ],
      },
      {
        id: "sdq_peer",
        icon: Users,
        title: isTr ? "Akran İlişkileri" : "Peer Relationships",
        subtitle: isTr ? "Sosyal ilişkilerinizi düşünün" : "Think about your social relationships",
        type: "multi",
        category: "clinical_sdq",
        options: [
          { value: "loner", label: isTr ? "Genellikle yalnız, tek başına oynar" : "Usually alone, plays alone", emoji: "🚶" },
          { value: "bullied", label: isTr ? "Zorbalığa uğrar veya alay edilir" : "Gets bullied or teased", emoji: "😔" },
          { value: "better_adults", label: isTr ? "Yaşıtlarından çok yetişkinlerle anlaşır" : "Gets along better with adults than peers", emoji: "👨‍👩‍👦" },
          { value: "no_friends", label: isTr ? "En az bir yakın arkadaşı yok" : "Doesn't have at least one close friend", emoji: "💔" },
          { value: "popular", label: isTr ? "Genel olarak sevilen biri" : "Generally liked by others", emoji: "🌟" },
        ],
      },
      {
        id: "sdq_conduct",
        icon: AlertTriangle,
        title: isTr ? "Davranışsal Sorunlar" : "Behavioral Issues",
        subtitle: isTr ? "Davranış özelliklerinizi belirtin" : "Identify your behavioral patterns",
        type: "multi",
        category: "clinical_sdq",
        options: [
          { value: "tantrums", label: isTr ? "Sık sık öfke nöbetleri yaşar" : "Frequently has temper tantrums", emoji: "😡" },
          { value: "disobedient", label: isTr ? "Genellikle söz dinlemez" : "Generally disobedient", emoji: "🙅" },
          { value: "fights", label: isTr ? "Sık kavga eder veya zorbalık yapar" : "Often fights or bullies", emoji: "👊" },
          { value: "lies", label: isTr ? "Yalan söyleme veya hile yapma eğilimi" : "Tends to lie or cheat", emoji: "🤥" },
          { value: "kind", label: isTr ? "Genellikle uyumlu ve nazik" : "Generally well-behaved and kind", emoji: "😊" },
        ],
      },
    );
  } else if (isAdult) {
    // ASRS (Adult ADHD Self-Report Scale) inspired questions
    clinicalQuestions.push(
      {
        id: "asrs_attention",
        icon: Target,
        title: isTr ? "Dikkat ve Konsantrasyon (ASRS)" : "Attention & Concentration (ASRS)",
        subtitle: isTr ? "Son 6 ayda ne sıklıkla yaşadınız?" : "How often in the last 6 months?",
        type: "multi",
        category: "clinical_asrs",
        options: [
          { value: "careless", label: isTr ? "Detaylara dikkat etmekte zorlanma, dikkatsiz hatalar" : "Difficulty paying attention to details, careless mistakes", emoji: "🔍" },
          { value: "sustain", label: isTr ? "Uzun süre dikkatini sürdürememe" : "Can't sustain attention for long", emoji: "⏳" },
          { value: "listen", label: isTr ? "Doğrudan konuşulduğunda dinlemiyor gibi görünme" : "Seems not to listen when spoken to directly", emoji: "👂" },
          { value: "follow_through", label: isTr ? "Verilen görevleri takip edememe" : "Can't follow through on instructions", emoji: "📝" },
          { value: "organize", label: isTr ? "Görevleri organize etmekte zorluk" : "Difficulty organizing tasks", emoji: "📋" },
          { value: "mental_effort", label: isTr ? "Sürekli zihinsel çaba gerektiren işlerden kaçınma" : "Avoiding tasks requiring sustained mental effort", emoji: "🧠" },
          { value: "loses_things", label: isTr ? "Eşyalarını sık kaybetme" : "Often loses things", emoji: "🔑" },
          { value: "distracted_external", label: isTr ? "Dış uyaranlarla kolay dikkat dağılması" : "Easily distracted by external stimuli", emoji: "🔔" },
          { value: "forgetful_daily", label: isTr ? "Günlük aktivitelerde unutkanlık" : "Forgetful in daily activities", emoji: "📅" },
        ],
      },
      {
        id: "asrs_hyperactivity",
        icon: Zap,
        title: isTr ? "Hiperaktivite ve Dürtüsellik (ASRS)" : "Hyperactivity & Impulsivity (ASRS)",
        subtitle: isTr ? "Kendinize en uygun olanları seçin" : "Select the ones that apply to you",
        type: "multi",
        category: "clinical_asrs",
        options: [
          { value: "fidgets", label: isTr ? "Elleri/ayakları kıpırdanır, oturduğu yerde kıpırdanır" : "Fidgets with hands/feet, squirms in seat", emoji: "🖐️" },
          { value: "leaves_seat", label: isTr ? "Oturması gereken yerlerde kalkma ihtiyacı" : "Need to get up when expected to sit", emoji: "🪑" },
          { value: "restless_feeling", label: isTr ? "İç huzursuzluk, sürekli bir şey yapma dürtüsü" : "Inner restlessness, urge to always do something", emoji: "🌀" },
          { value: "cant_leisure", label: isTr ? "Sessizce boş zaman aktivitesi yapamama" : "Can't do leisure activities quietly", emoji: "🔇" },
          { value: "on_the_go", label: isTr ? "Sürekli hareket halinde, 'motor takılmış gibi'" : "Always on the go, 'driven by a motor'", emoji: "🏃" },
          { value: "talks_excessive", label: isTr ? "Aşırı konuşma" : "Talks excessively", emoji: "💬" },
          { value: "blurts", label: isTr ? "Soru bitmeden cevap verme" : "Blurts out answers before questions finish", emoji: "⚡" },
          { value: "cant_wait", label: isTr ? "Sıra beklemekte zorluk" : "Difficulty waiting in turn", emoji: "⏰" },
          { value: "interrupts", label: isTr ? "Başkalarının sözünü kesme" : "Interrupts or intrudes on others", emoji: "✋" },
        ],
      },
      // WURS - Childhood recall
      {
        id: "wurs_childhood",
        icon: BookOpen,
        title: isTr ? "Çocukluk Dönemi Belirtileri (WURS)" : "Childhood Symptoms (WURS)",
        subtitle: isTr ? "Çocukluğunuzu düşünerek yanıtlayın (5-12 yaş)" : "Think back to your childhood (ages 5-12)",
        type: "multi",
        category: "clinical_wurs",
        options: [
          { value: "hyperactive_child", label: isTr ? "Çok hareketli, yerinde duramayan bir çocuktum" : "I was a very active, restless child", emoji: "🏃‍♂️" },
          { value: "attention_child", label: isTr ? "Dikkatim kolay dağılırdı" : "I was easily distracted", emoji: "🎯" },
          { value: "trouble_school", label: isTr ? "Okulda sık sorun yaşardım" : "I often had trouble at school", emoji: "🏫" },
          { value: "impulsive_child", label: isTr ? "Dürtüsel davranırdım, düşünmeden hareket ederdim" : "I was impulsive, acted without thinking", emoji: "💨" },
          { value: "mood_child", label: isTr ? "Ruh halim sık değişirdi" : "My mood changed frequently", emoji: "🎭" },
          { value: "temper_child", label: isTr ? "Öfke kontrolünde problem yaşardım" : "I had trouble controlling my temper", emoji: "😤" },
          { value: "finish_child", label: isTr ? "Başladığım işleri bitirmekte zorlanırdım" : "I had trouble finishing things I started", emoji: "📋" },
          { value: "daydream_child", label: isTr ? "Sık hayal kurardım, dalıp giderdim" : "I often daydreamed, zoned out", emoji: "☁️" },
        ],
        hasOther: true,
        otherPlaceholder: isTr ? "Çocukluk döneminizle ilgili başka belirtiler..." : "Other childhood symptoms...",
      },
    );

    // HADS - Anxiety & Depression
    clinicalQuestions.push(
      {
        id: "hads_anxiety",
        icon: Activity,
        title: isTr ? "Kaygı Değerlendirmesi (HADS)" : "Anxiety Assessment (HADS)",
        subtitle: isTr ? "Son bir haftayı düşünerek yanıtlayın" : "Think about the last week",
        type: "multi",
        category: "clinical_hads",
        options: [
          { value: "tense", label: isTr ? "Gergin veya huzursuz hissediyorum" : "I feel tense or restless", emoji: "😣" },
          { value: "worry", label: isTr ? "Endişeli düşünceler sürekli aklıma geliyor" : "Worrying thoughts keep going through my mind", emoji: "🔄" },
          { value: "fear", label: isTr ? "Kötü bir şey olacakmış gibi korku hissediyorum" : "I get a feeling of fear as if something bad will happen", emoji: "😨" },
          { value: "relaxation", label: isTr ? "Rahatlayamıyorum, sürekli tetikte hissediyorum" : "I can't relax, I feel on edge", emoji: "😤" },
          { value: "butterflies", label: isTr ? "Mide bulantısı/karın ağrısı gibi fiziksel kaygı belirtileri" : "Physical anxiety symptoms like nausea/stomach ache", emoji: "🦋" },
          { value: "panic", label: isTr ? "Panik atakları yaşıyorum" : "I experience panic attacks", emoji: "⚠️" },
        ],
      },
      {
        id: "hads_depression",
        icon: Frown,
        title: isTr ? "Ruh Hali Değerlendirmesi (HADS)" : "Mood Assessment (HADS)",
        subtitle: isTr ? "Son bir haftayı düşünerek yanıtlayın" : "Think about the last week",
        type: "multi",
        category: "clinical_hads",
        options: [
          { value: "enjoy", label: isTr ? "Daha önce zevk aldığım şeylerden artık zevk almıyorum" : "I no longer enjoy things I used to", emoji: "😕" },
          { value: "laugh", label: isTr ? "Gülebiliyorum ve olayların komik tarafını görebiliyorum" : "I can still laugh and see the funny side", emoji: "😊" },
          { value: "cheerful", label: isTr ? "Kendimi neşeli hissetmiyorum" : "I don't feel cheerful", emoji: "😔" },
          { value: "slowed", label: isTr ? "Kendimi yavaşlamış gibi hissediyorum" : "I feel as if I've slowed down", emoji: "🐌" },
          { value: "appearance", label: isTr ? "Görünümüme ilgimi kaybettim" : "I've lost interest in my appearance", emoji: "👤" },
          { value: "look_forward", label: isTr ? "Gelecekle ilgili heyecan duymuyorum" : "I don't look forward to things", emoji: "📅" },
        ],
      },
    );
  }

  // ── PHASE 4: Common final questions ──
  const finalQuestions: Question[] = [
    {
      id: "sleepQuality",
      icon: Moon,
      title: isTr ? "Uyku kalitenizi nasıl değerlendirirsiniz?" : "How would you rate your sleep quality?",
      subtitle: isTr ? "Uyku kalitesi DEHB semptomlarını doğrudan etkiler" : "Sleep quality directly affects ADHD symptoms",
      type: "single",
      category: "lifestyle",
      options: [
        { value: "very_bad", label: isTr ? "Çok kötü - sürekli uyanıyorum" : "Very bad - I keep waking up", emoji: "😫" },
        { value: "bad", label: isTr ? "Kötü - uyumakta zorlanıyorum" : "Bad - I struggle to fall asleep", emoji: "😴" },
        { value: "average", label: isTr ? "Orta - bazen sorun yaşıyorum" : "Average - sometimes I have issues", emoji: "😐" },
        { value: "good", label: isTr ? "İyi - genellikle rahat uyuyorum" : "Good - I usually sleep well", emoji: "🙂" },
        { value: "very_good", label: isTr ? "Çok iyi" : "Very good", emoji: "😊" },
      ],
    },
    {
      id: "stressLevel",
      icon: Zap,
      title: isTr ? "Genel stres seviyeniz nasıl?" : "What is your general stress level?",
      subtitle: isTr ? "Stres DEHB semptomlarını şiddetlendirebilir" : "Stress can intensify ADHD symptoms",
      type: "single",
      category: "lifestyle",
      options: [
        { value: "very_high", label: isTr ? "Çok yüksek" : "Very high", emoji: "🔴" },
        { value: "high", label: isTr ? "Yüksek" : "High", emoji: "🟠" },
        { value: "moderate", label: isTr ? "Orta" : "Moderate", emoji: "🟡" },
        { value: "low", label: isTr ? "Düşük" : "Low", emoji: "🟢" },
        { value: "very_low", label: isTr ? "Çok düşük" : "Very low", emoji: "💚" },
      ],
    },
    // Comorbidity question for adults
    ...(isAdult
      ? [
          {
            id: "comorbidity",
            icon: Activity as LucideIcon,
            title: isTr ? "Daha önce tanı almış durumlar" : "Previously diagnosed conditions",
            subtitle: isTr ? "Varsa birden fazla seçebilirsiniz" : "Select multiple if applicable",
            type: "multi" as const,
            category: "clinical_comorbidity",
            options: [
              { value: "anxiety_disorder", label: isTr ? "Anksiyete / Kaygı Bozukluğu" : "Anxiety Disorder", emoji: "😰" },
              { value: "depression", label: isTr ? "Depresyon" : "Depression", emoji: "😔" },
              { value: "bipolar", label: isTr ? "Bipolar Bozukluk" : "Bipolar Disorder", emoji: "🔄" },
              { value: "add", label: isTr ? "Dikkat Eksikliği (ADD)" : "Attention Deficit (ADD)", emoji: "🎯" },
              { value: "substance", label: isTr ? "Madde kullanım sorunları" : "Substance use issues", emoji: "🚫" },
              { value: "none", label: isTr ? "Hiçbiri / Tanı almadım" : "None / Not diagnosed", emoji: "✅" },
              { value: "other", label: isTr ? "Diğer" : "Other", emoji: "✏️" },
            ],
            hasOther: true,
            otherPlaceholder: isTr ? "Başka tanılarınızı yazın..." : "Enter other diagnoses...",
          },
        ]
      : []),
    // Free-text question for additional context
    {
      id: "additionalInfo",
      icon: Edit3,
      title: isTr ? "Eklemek istediğiniz bilgi var mı?" : "Anything else you'd like to add?",
      subtitle: isTr
        ? "DEHB ile ilgili deneyimlerinizi paylaşın, yapay zeka analiz edecek"
        : "Share your ADHD-related experiences, AI will analyze them",
      type: "text",
      category: "other",
      otherPlaceholder: isTr
        ? "Örn: Toplantılarda dikkatim dağılıyor, çocukken çok hareketliydim, işleri son dakikaya bırakırım..."
        : "E.g.: I get distracted in meetings, I was very active as a child, I leave things to the last minute...",
    },
  ];

  return [...base, ...clinicalQuestions, ...finalQuestions];
}

// ─── Analysis Engine ────────────────────────────────────────────────────
function analyzeProfile(profile: UserProfile, locale: string): AnalysisResult {
  const isTr = locale === "tr";
  let riskScore = 0;

  const screenScores: Record<string, number> = { "1-2": 0, "3-4": 10, "5-6": 20, "7-8": 30, "9+": 40 };
  riskScore += screenScores[profile.screenTime] || 0;

  const focusScores: Record<string, number> = { "5min": 30, "5-15": 20, "15-30": 10, "30-60": 5, "60+": 0 };
  riskScore += focusScores[profile.focusDuration] || 0;

  const sleepScores: Record<string, number> = { very_bad: 20, bad: 15, average: 8, good: 3, very_good: 0 };
  riskScore += sleepScores[profile.sleepQuality] || 0;

  const stressScores: Record<string, number> = { very_high: 15, high: 10, moderate: 5, low: 2, very_low: 0 };
  riskScore += stressScores[profile.stressLevel] || 0;

  riskScore += Math.min(profile.challenges.length * 3, 15);

  const riskLevel: "low" | "moderate" | "high" = riskScore >= 60 ? "high" : riskScore >= 35 ? "moderate" : "low";

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
      ? "Ders çalışma, sınav stresi ve sosyal hayat dengesinde zorlanan genç DEHB profili."
      : "Young ADHD profile struggling to balance studying, exam stress and social life.";
  } else if (isStudent) {
    profileType = isTr ? "Akademik Profil" : "Academic Profile";
    profileDesc = isTr
      ? "Akademik kariyer hedefleyen, yoğun okuma ve araştırma gerektiren bir DEHB profili."
      : "ADHD profile targeting academic career, requiring intensive reading and research.";
  } else if (isTech && isWorking) {
    profileType = isTr ? "Teknoloji Profesyoneli" : "Tech Professional";
    profileDesc = isTr
      ? "Ekran başında uzun saatler geçiren, multitasking gerektiren bir DEHB profili."
      : "ADHD profile spending long hours at screen with multitasking demands.";
  } else if (isCreative) {
    profileType = isTr ? "Yaratıcı Profil" : "Creative Profile";
    profileDesc = isTr
      ? "Hiperfokus dönemlerini verimli kullanabilen ama rutin işlerde zorlanan yaratıcı DEHB profili."
      : "Creative ADHD profile that uses hyperfocus productively but struggles with routine.";
  } else if (isWorking) {
    profileType = isTr ? "Çalışan Profesyonel" : "Working Professional";
    profileDesc = isTr
      ? "İş yerinde performans baskısı yaşayan, toplantı ve deadline'larla boğuşan DEHB profili."
      : "ADHD profile experiencing performance pressure at work.";
  } else {
    profileType = isTr ? "Genel Profil" : "General Profile";
    profileDesc = isTr
      ? "Günlük yaşamda DEHB semptomlarıyla başa çıkmaya çalışan profil."
      : "Profile trying to cope with ADHD symptoms in daily life.";
  }

  const products: ProductRec[] = [];
  const challenges = profile.challenges;

  if (challenges.includes("focus") || challenges.includes("procrastination")) {
    products.push({
      name: isTr ? "Focus Timer - Pomodoro Zamanlayıcı" : "Focus Timer - Pomodoro Timer",
      slug: "focus-timer-pomodoro",
      image: "/products/pomodoro-timer.png",
      reason: isTr ? "Odaklanma sürenizi artırmak için bilimsel Pomodoro tekniği" : "Scientific Pomodoro technique to increase focus",
      price: isTr ? "₺299.90" : "$17.99",
      match: 95,
    });
  }

  if (challenges.includes("hyperactivity") || challenges.includes("anxiety")) {
    products.push({
      name: isTr ? "Fidget Cube - 6 Yüzlü Stres Küpü" : "Fidget Cube - 6-Sided",
      slug: "fidget-cube-stres-kupu",
      image: "/products/fidget-cube.png",
      reason: isTr ? "Hiperaktiviteyi kanalize eder" : "Channels hyperactivity",
      price: isTr ? "₺149.90" : "$8.99",
      match: 88,
    });
  }

  if (challenges.includes("time") || challenges.includes("organization")) {
    products.push({
      name: isTr ? "ADHD Focus Planner" : "ADHD Focus Planner",
      slug: "adhd-focus-planner",
      image: "/products/focus-planner.png",
      reason: isTr ? "DEHB beyni için özel tasarlanmış planlayıcı" : "Planner designed for the ADHD brain",
      price: isTr ? "₺349.90" : "$19.99",
      match: 93,
    });
  }

  if (challenges.includes("sleep") || profile.sleepQuality === "very_bad" || profile.sleepQuality === "bad") {
    products.push({
      name: isTr ? "Beyaz Gürültü Makinesi" : "White Noise Machine",
      slug: "beyaz-gurultu-makinesi",
      image: "/products/white-noise-machine.png",
      reason: isTr ? "Uyku düzensizliğiniz için beyaz gürültü" : "White noise for sleep irregularity",
      price: isTr ? "₺399.90" : "$22.99",
      match: 91,
    });
  }

  if (profile.screenTime === "7-8" || profile.screenTime === "9+") {
    products.push({
      name: isTr ? "Mavi Işık Filtreli Gözlük" : "Blue Light Blocking Glasses",
      slug: "mavi-isik-filtreli-gozluk",
      image: "/products/blue-light-glasses.png",
      reason: isTr ? "Yüksek ekran süresi gözlerinizi etkiler" : "High screen time affects your eyes",
      price: isTr ? "₺199.90" : "$11.99",
      match: 86,
    });
  }

  if (products.length === 0) {
    products.push(
      { name: isTr ? "Fidget Cube" : "Fidget Cube", slug: "fidget-cube-stres-kupu", image: "/products/fidget-cube.png", reason: isTr ? "Genel stres yönetimi" : "General stress management", price: isTr ? "₺149.90" : "$8.99", match: 75 },
      { name: isTr ? "Focus Planner" : "Focus Planner", slug: "adhd-focus-planner", image: "/products/focus-planner.png", reason: isTr ? "Günlük yapı kurma" : "Build daily structure", price: isTr ? "₺349.90" : "$19.99", match: 70 },
    );
  }

  products.sort((a, b) => b.match - a.match);

  const tips: Tip[] = [];

  if (challenges.includes("focus")) {
    tips.push({
      icon: Target,
      title: isTr ? "Pomodoro Tekniği Uygulayın" : "Apply Pomodoro Technique",
      desc: isTr ? "25 dakika odaklanma + 5 dakika mola döngüsü." : "25 min focus + 5 min break cycle.",
      color: "from-blue-500 to-indigo-600",
    });
  }

  if (challenges.includes("sleep") || profile.sleepQuality === "very_bad" || profile.sleepQuality === "bad") {
    tips.push({
      icon: Moon,
      title: isTr ? "Uyku Hijyeni Kuralları" : "Sleep Hygiene Rules",
      desc: isTr ? "Yatmadan 2 saat önce ekranları kapatın." : "Turn off screens 2 hours before bed.",
      color: "from-purple-500 to-pink-600",
    });
  }

  if (challenges.includes("time") || challenges.includes("procrastination")) {
    tips.push({
      icon: Clock,
      title: isTr ? "2 Dakika Kuralı" : "2 Minute Rule",
      desc: isTr ? "2 dakikadan az sürecek işleri hemen yapın." : "Do tasks under 2 minutes immediately.",
      color: "from-orange-500 to-red-600",
    });
  }

  if (challenges.includes("organization")) {
    tips.push({
      icon: BookOpen,
      title: isTr ? "Her Şeyin Bir Yeri Olsun" : "A Place for Everything",
      desc: isTr ? "Her eşyaya sabit bir yer belirleyin." : "Assign a fixed place for each item.",
      color: "from-green-500 to-emerald-600",
    });
  }

  if (challenges.includes("anxiety") || profile.stressLevel === "very_high" || profile.stressLevel === "high") {
    tips.push({
      icon: Heart,
      title: isTr ? "4-7-8 Nefes Tekniği" : "4-7-8 Breathing Technique",
      desc: isTr ? "4 saniye nefes alın, 7 saniye tutun, 8 saniye verin." : "Inhale 4s, hold 7s, exhale 8s.",
      color: "from-pink-500 to-rose-600",
    });
  }

  tips.push({
    icon: Coffee,
    title: isTr ? "Egzersiz Yapın" : "Exercise",
    desc: isTr ? "Günde en az 30 dakika yürüyüş veya spor." : "At least 30 minutes of exercise daily.",
    color: "from-teal-500 to-cyan-600",
  });

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
        "07:00 - Wake up, no phone, 5 min breathing exercise",
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
      ? "Değerlendirme sonuçlarınız yüksek düzeyde DEHB semptomları göstermektedir. Bir uzmana danışmanızı önemle öneriyoruz."
      : riskLevel === "moderate"
        ? "Orta düzeyde DEHB semptomları tespit edildi. Doğru araçlar ve stratejilerle günlük yaşam kalitesini artırabilirsiniz."
        : "Düşük düzeyde DEHB semptomları gösteriyorsunuz."
    : riskLevel === "high"
      ? "Your results indicate high-level ADHD symptoms. We strongly recommend consulting a specialist."
      : riskLevel === "moderate"
        ? "Moderate ADHD symptoms detected. With the right tools and strategies, you can improve daily life quality."
        : "You show low-level ADHD symptoms.";

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

// ─── Chatbot Component ──────────────────────────────────────────────────
function Chatbot({
  locale,
  result,
}: {
  locale: string;
  result: AnalysisResult | null;
}) {
  const isTr = locale === "tr";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: isTr
        ? "Merhaba! Ben Dopamind DEHB asistanıyım. Değerlendirme sonuçlarınız, DEHB belirtileri veya stratejiler hakkında sorularınızı yanıtlayabilirim."
        : "Hello! I'm the Dopamind ADHD assistant. I can answer your questions about your assessment results, ADHD symptoms, or strategies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.assessChatbot({
        message: userMsg,
        context: result
          ? {
              risk_level: result.riskLevel,
              risk_score: result.riskScore,
              adhd_probability: result.riskScore / 100,
              profile_type: result.profileType,
              subscores: result.subscores || {},
            }
          : {},
        locale,
      });
      setMessages((prev) => [...prev, { role: "bot", text: res.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: isTr
            ? "Üzgünüm, şu an yanıt veremiyorum. Lütfen daha sonra tekrar deneyin."
            : "Sorry, I can't respond right now. Please try again later.",
        },
      ]);
    }
    setLoading(false);
  };

  const quickQuestions = isTr
    ? ["DEHB nedir?", "Sonuçlarım ne anlama geliyor?", "Tedavi seçenekleri neler?", "Kadınlarda DEHB"]
    : ["What is ADHD?", "What do my results mean?", "Treatment options?", "ADHD in women"];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#5a7a52] text-white shadow-lg hover:bg-[#4a6a44] transition-all flex items-center justify-center"
        title={isTr ? "DEHB Asistanı" : "ADHD Assistant"}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#5a7a52] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className="font-semibold text-sm">
            {isTr ? "Dopamind DEHB Asistanı" : "Dopamind ADHD Assistant"}
          </span>
        </div>
        <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[340px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#5a7a52] text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm text-sm text-gray-500">
              <span className="animate-pulse">{isTr ? "Yazıyor..." : "Typing..."}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => {
                setInput(q);
                setTimeout(() => {
                  setInput("");
                  setMessages((prev) => [...prev, { role: "user", text: q }]);
                  setLoading(true);
                  api
                    .assessChatbot({
                      message: q,
                      context: result
                        ? { risk_level: result.riskLevel, risk_score: result.riskScore, adhd_probability: result.riskScore / 100 }
                        : {},
                      locale,
                    })
                    .then((res) => setMessages((prev) => [...prev, { role: "bot", text: res.response }]))
                    .catch(() =>
                      setMessages((prev) => [
                        ...prev,
                        { role: "bot", text: isTr ? "Yanıt verilemedi." : "Could not respond." },
                      ]),
                    )
                    .finally(() => setLoading(false));
                }, 100);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-[#5a7a52]/10 text-[#5a7a52] hover:bg-[#5a7a52]/20 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 px-3 py-2 flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={isTr ? "DEHB hakkında soru sorun..." : "Ask about ADHD..."}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#5a7a52] text-gray-800"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="px-3 py-2 rounded-lg bg-[#5a7a52] text-white hover:bg-[#4a6a44] disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function AssessmentPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const isTr = locale === "tr";

  const [step, setStep] = useState(-1); // -1 = intro
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
  const [otherAnalysis, setOtherAnalysis] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Questions are dynamic based on age selection
  const selectedAge = answers.age as string | undefined;
  const questions = getQuestions(locale, selectedAge);
  const totalSteps = questions.length;
  const currentQ = step >= 0 && step < totalSteps ? questions[step] : null;

  // Scroll to top on mobile when navigating between questions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleSelect = (value: string) => {
    if (!currentQ) return;
    if (currentQ.type === "multi") {
      const prev = (answers[currentQ.id] as string[]) || [];
      const updated = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: value });
      // Auto-advance for single-select
      setTimeout(() => {
        if (step < totalSteps - 1) {
          setStep(step + 1);
        }
      }, 300);
    }
  };

  const handleOtherText = (questionId: string, text: string) => {
    setOtherTexts({ ...otherTexts, [questionId]: text });
  };

  const evaluateOtherText = async (questionId: string, text: string) => {
    if (!text.trim()) return;
    try {
      const res = await api.evaluateOther({ text, question_id: questionId, locale });
      setOtherAnalysis((prev) => ({ ...prev, [questionId]: res }));
    } catch {
      // silently fail
    }
  };

  const canProceed = () => {
    if (!currentQ) return false;
    if (currentQ.type === "text") return true; // text is optional
    const answer = answers[currentQ.id];
    if (currentQ.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return !!answer;
  };

  const handleNext = () => {
    // Evaluate "other" texts before advancing
    const otherText = currentQ ? otherTexts[currentQ.id] : "";
    if (otherText && currentQ) {
      evaluateOtherText(currentQ.id, otherText);
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      runAnalysis();
    }
  };

  const buildClinicalScores = () => {
    const isChild = selectedAge === "13-17";
    const clinical: Record<string, unknown> = {};

    if (isChild) {
      // SDQ scoring from multi-select clinical questions
      const hyperItems = (answers.sdq_hyperactivity as string[]) || [];
      const emotionalItems = (answers.sdq_emotional as string[]) || [];
      const peerItems = (answers.sdq_peer as string[]) || [];
      const conductItems = (answers.sdq_conduct as string[]) || [];

      // Score: each negative item = ~8 points, positive item reduces
      clinical.sdq_hyperactivity = Math.min(50, hyperItems.filter((i) => i !== "attention_good").length * 10 - (hyperItems.includes("attention_good") ? 10 : 0));
      clinical.sdq_emotional = emotionalItems.length * 8;
      clinical.sdq_peer = Math.min(40, peerItems.filter((i) => i !== "popular").length * 8 - (peerItems.includes("popular") ? 5 : 0));
      clinical.sdq_conduct = Math.min(40, conductItems.filter((i) => i !== "kind").length * 8 - (conductItems.includes("kind") ? 5 : 0));
      clinical.sdq_prosocial = conductItems.includes("kind") ? 30 : 20;
      clinical.sdq_impact = Math.min(10, (hyperItems.length + emotionalItems.length + peerItems.length + conductItems.length) / 2);
    } else {
      // ASRS scoring
      const asrsAttention = (answers.asrs_attention as string[]) || [];
      const asrsHyper = (answers.asrs_hyperactivity as string[]) || [];
      const wursItems = (answers.wurs_childhood as string[]) || [];
      const hadsAnxiety = (answers.hads_anxiety as string[]) || [];
      const hadsDepression = (answers.hads_depression as string[]) || [];
      const comorbidity = (answers.comorbidity as string[]) || [];

      // ASRS: each item ~ 4-8 points on the ASRS scale
      clinical.asrs = Math.min(72, (asrsAttention.length * 5) + (asrsHyper.length * 4));
      // WURS: retrospective childhood, each item ~ 8-12 points
      clinical.wurs = Math.min(100, wursItems.length * 12);
      // HADS-A: each item ~ 3 points
      clinical.hads_anxiety = Math.min(21, hadsAnxiety.length * 3);
      // HADS-D: each item ~ 3 points, positive items reduce
      clinical.hads_depression = Math.min(21, hadsDepression.filter((i) => i !== "laugh").length * 3 - (hadsDepression.includes("laugh") ? 3 : 0));
      // MADRS: derived from depression + sleep
      const sleepMap: Record<string, number> = { very_bad: 12, bad: 8, average: 4, good: 1, very_good: 0 };
      clinical.madrs = Math.min(60, (clinical.hads_depression as number) * 2 + (sleepMap[(answers.sleepQuality as string)] || 4));

      // Comorbidities
      clinical.anxiety_disorder = comorbidity.includes("anxiety_disorder") ? 1 : 0;
      clinical.bipolar = comorbidity.includes("bipolar") ? 1 : 0;
      clinical.add = comorbidity.includes("add") ? 1 : 0;
      clinical.substance = comorbidity.includes("substance") ? 1 : 0;
      clinical.unipolar = comorbidity.includes("depression") ? 1 : 0;
      clinical.other_comorbid = comorbidity.includes("other") ? 1 : 0;
    }

    return clinical;
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
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

    // Build clinical scores from detailed questions
    const clinical = buildClinicalScores();

    // Combine "other" text analyses
    const combinedOtherAnalysis: Record<string, unknown> = {};
    for (const [qId, analysis] of Object.entries(otherAnalysis)) {
      if (analysis && typeof analysis === "object" && "categories" in analysis) {
        const cat = (analysis as { categories: Record<string, unknown> }).categories;
        Object.assign(combinedOtherAnalysis, cat);
      }
    }

    // Also evaluate the freetext additionalInfo if present
    const additionalText = (answers.additionalInfo as string) || otherTexts.additionalInfo || "";
    if (additionalText) {
      try {
        const textRes = await api.evaluateOther({ text: additionalText, question_id: "additionalInfo", locale });
        Object.assign(combinedOtherAnalysis, textRes.categories);
      } catch {
        // continue without
      }
    }

    try {
      const mlResult = await api.assessADHD({
        age: profile.age,
        gender: profile.gender,
        answers: {
          screenTime: profile.screenTime,
          focusDuration: profile.focusDuration,
          sleepQuality: profile.sleepQuality,
          stressLevel: profile.stressLevel,
          challenges: profile.challenges,
          education: profile.education,
          employment: profile.employment,
          profession: profile.profession,
          clinical,
          other_analysis: combinedOtherAnalysis,
        },
      });

      const localResult = analyzeProfile(profile, locale);
      localResult.riskLevel = mlResult.adhd_risk;
      localResult.riskScore = Math.round(mlResult.adhd_probability * 100);
      localResult.subscores = mlResult.subscores;
      localResult.summary = isTr
        ? `Yapay zeka modelimiz DEHB olasılığınızı %${localResult.riskScore} olarak hesapladı. ${
            mlResult.adhd_risk === "high"
              ? "Sonuçlarınız yüksek risk gösteriyor, bir uzmana başvurmanızı öneririz."
              : mlResult.adhd_risk === "moderate"
              ? "Orta düzey risk tespit edildi, detaylı değerlendirme faydalı olabilir."
              : "Düşük risk tespit edildi, ancak endişeleriniz varsa bir uzmana danışın."
          }`
        : `Our AI model calculated your ADHD probability at ${localResult.riskScore}%. ${
            mlResult.adhd_risk === "high"
              ? "Your results indicate high risk, we recommend consulting a specialist."
              : mlResult.adhd_risk === "moderate"
              ? "Moderate risk detected, a detailed evaluation may be beneficial."
              : "Low risk detected, but consult a specialist if you have concerns."
          }`;
      setResult(localResult);
    } catch {
      setResult(analyzeProfile(profile, locale));
    }

    setIsAnalyzing(false);
    setStep(totalSteps);
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
            {isTr ? "Dopamind DEHB Değerlendirme" : "Dopamind ADHD Assessment"}
          </h1>
          <p className="text-gray-600 mb-3 leading-relaxed">
            {isTr
              ? "Klinik ölçeklere dayalı detaylı sorularla profilinizi analiz edip, yapay zeka destekli kişisel değerlendirme sunacağız."
              : "We'll analyze your profile with detailed clinical-scale questions and provide AI-powered personalized assessment."}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {[
              isTr ? "SDQ Ölçeği" : "SDQ Scale",
              isTr ? "ASRS Ölçeği" : "ASRS Scale",
              isTr ? "WURS Ölçeği" : "WURS Scale",
              isTr ? "HADS Ölçeği" : "HADS Scale",
            ].map((badge) => (
              <span key={badge} className="text-xs px-2.5 py-1 rounded-full bg-[#5a7a52]/10 text-[#5a7a52] font-medium">
                {badge}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-8 font-mono uppercase tracking-widest">
            {isTr
              ? "Bu değerlendirme tıbbi bir teşhis değildir. Profesyonel değerlendirme için bir uzmana başvurun."
              : "This assessment is not a medical diagnosis. Consult a specialist for professional evaluation."}
          </p>
          <button
            onClick={() => setStep(0)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#5a7a52] text-white font-semibold hover:bg-[#4a6a44] transition-all text-lg"
          >
            {isTr ? "Değerlendirmeye Başla" : "Start Assessment"}
            <ArrowRight className="w-5 h-5 text-white/90" />
          </button>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400 font-mono uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" /> {isTr ? "~5 dakika" : "~5 minutes"}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-gray-500" /> {isTr ? "Anonim" : "Anonymous"}
            </span>
            <span className="flex items-center gap-1">
              <Brain className="w-4 h-4 text-gray-500" /> {isTr ? "ML Destekli" : "ML Powered"}
            </span>
          </div>
        </div>
        {/* Chatbot available on intro too */}
        <Chatbot locale={locale} result={null} />
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
            {isTr ? "Yapay Zeka Analiz Ediyor..." : "AI is Analyzing..."}
          </h2>
          <p className="text-gray-600">
            {isTr
              ? "Klinik ölçek yanıtlarınız ML modeli ile değerlendiriliyor"
              : "Your clinical scale responses are being evaluated with ML model"}
          </p>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ───────────────────────────────────────────────
  if (result && step >= totalSteps) {
    const riskColors = {
      low: "text-[#5a7a52] bg-[#5a7a52]/10 border-[#5a7a52]/30",
      moderate: "text-amber-600 bg-amber-500/10 border-amber-500/30",
      high: "text-red-600 bg-red-500/10 border-red-500/30",
    };
    const riskLabels = { low: isTr ? "Düşük" : "Low", moderate: isTr ? "Orta" : "Moderate", high: isTr ? "Yüksek" : "High" };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 bg-[#E0E7D7] min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5a7a52]/10 text-[#5a7a52] text-sm font-medium mb-4 font-mono uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-[#5a7a52]" />
            {isTr ? "ML Destekli Analiz Sonucu" : "ML-Powered Analysis Result"}
          </div>
          <h1 className="text-3xl font-bold text-[#2d3a2a] mb-2 italic font-serif">{result.profileType}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{result.profileDesc}</p>
        </div>

        {/* Risk Score */}
        <div className={`p-6 rounded-2xl border shadow-sm bg-white/70 backdrop-blur-sm ${riskColors[result.riskLevel]} mb-8`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#2d3a2a]">
              {isTr ? "DEHB Belirti Seviyesi" : "ADHD Symptom Level"}: {riskLabels[result.riskLevel]}
            </h3>
            <span className="text-2xl font-bold text-[#2d3a2a]">{result.riskScore}/100</span>
          </div>
          <div className="w-full h-3 bg-[#E0E7D7]/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${result.riskScore}%`,
                background: result.riskLevel === "high" ? "#ef4444" : result.riskLevel === "moderate" ? "#f59e0b" : "#5a7a52",
              }}
            />
          </div>
          <p className="text-sm mt-3 text-gray-600">{result.summary}</p>
        </div>

        {/* Subscores */}
        {result.subscores && Object.keys(result.subscores).length > 0 && (
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30 mb-8">
            <h3 className="font-bold text-[#2d3a2a] mb-4">
              {isTr ? "Detaylı Alt Skorlar" : "Detailed Subscores"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(result.subscores).map(([key, value]) => {
                const labels: Record<string, string> = isTr
                  ? {
                      hyperactivity: "Hiperaktivite",
                      conduct_problems: "Davranış",
                      emotional_problems: "Duygusal",
                      peer_problems: "Akran İlişkileri",
                      prosocial: "Prososyal",
                      total_difficulties: "Toplam Güçlük",
                      impact: "Etki",
                      wurs_childhood: "WURS (Çocukluk)",
                      asrs_current: "ASRS (Güncel)",
                      anxiety: "Kaygı",
                      depression: "Depresyon",
                      madrs: "MADRS",
                      focus_score: "Odaklanma",
                    }
                  : {
                      hyperactivity: "Hyperactivity",
                      conduct_problems: "Conduct",
                      emotional_problems: "Emotional",
                      peer_problems: "Peer Relations",
                      prosocial: "Prosocial",
                      total_difficulties: "Total Difficulties",
                      impact: "Impact",
                      wurs_childhood: "WURS (Childhood)",
                      asrs_current: "ASRS (Current)",
                      anxiety: "Anxiety",
                      depression: "Depression",
                      madrs: "MADRS",
                      focus_score: "Focus",
                    };
                return (
                  <div key={key} className="p-3 rounded-lg bg-[#E0E7D7]/40">
                    <div className="text-xs text-gray-500 mb-1">{labels[key] || key}</div>
                    <div className="text-lg font-bold text-[#2d3a2a]">{value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#2d3a2a] mb-2 italic font-serif">
            {isTr ? "Size Özel Ürün Önerileri" : "Personalized Product Recommendations"}
          </h2>
          <p className="text-gray-600 mb-6">
            {isTr ? "Profilinize göre en çok fayda sağlayacak ürünler" : "Products that will benefit you most"}
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
                ? "Bu değerlendirme bilgilendirme amaçlıdır ve tıbbi bir teşhis yerine geçmez. DEHB teşhisi için mutlaka bir psikiyatrist veya klinik psikologa başvurun."
                : "This assessment is for informational purposes and does not replace a medical diagnosis. Consult a psychiatrist or clinical psychologist for an ADHD diagnosis."}
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
            onClick={() => {
              setStep(-1);
              setAnswers({});
              setOtherTexts({});
              setOtherAnalysis({});
              setResult(null);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold hover:border-gray-300 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-gray-500" />
            {isTr ? "Tekrar Değerlendir" : "Retake Assessment"}
          </button>
        </div>

        {/* Chatbot on results */}
        <Chatbot locale={locale} result={result} />
      </div>
    );
  }

  // ─── QUESTION SCREEN ──────────────────────────────────────────────
  const progress = ((step + 1) / totalSteps) * 100;
  const isMulti = currentQ?.type === "multi";
  const isText = currentQ?.type === "text";
  const selectedValue = currentQ ? answers[currentQ.id] : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#E0E7D7] pt-24">
      {/* Progress Bar */}
      <div className="sticky top-24 z-40 bg-[#E0E7D7] border-b border-[#B7C396]/30">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2 font-mono uppercase tracking-widest">
            <span>
              {isTr ? `Soru ${step + 1} / ${totalSteps}` : `Question ${step + 1} / ${totalSteps}`}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5a7a52] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Category indicator */}
          {currentQ?.category && (
            <div className="mt-1.5 flex justify-center">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5a7a52]/10 text-[#5a7a52] font-mono uppercase tracking-widest">
                {currentQ.category === "demographic"
                  ? isTr ? "Demografik" : "Demographic"
                  : currentQ.category === "lifestyle"
                  ? isTr ? "Yaşam Tarzı" : "Lifestyle"
                  : currentQ.category === "symptoms"
                  ? isTr ? "Semptomlar" : "Symptoms"
                  : currentQ.category === "clinical_sdq"
                  ? "SDQ"
                  : currentQ.category === "clinical_asrs"
                  ? "ASRS"
                  : currentQ.category === "clinical_wurs"
                  ? "WURS"
                  : currentQ.category === "clinical_hads"
                  ? "HADS"
                  : currentQ.category === "clinical_comorbidity"
                  ? isTr ? "Komorbidite" : "Comorbidity"
                  : currentQ.category === "other"
                  ? isTr ? "Serbest Metin" : "Free Text"
                  : ""}
              </span>
            </div>
          )}
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

          {/* Text input question */}
          {isText && currentQ && (
            <div className="space-y-3">
              <textarea
                value={(answers[currentQ.id] as string) || otherTexts[currentQ.id] || ""}
                onChange={(e) => {
                  setAnswers({ ...answers, [currentQ.id]: e.target.value });
                  handleOtherText(currentQ.id, e.target.value);
                }}
                placeholder={currentQ.otherPlaceholder}
                className="w-full h-32 p-4 rounded-xl border-2 border-gray-200 focus:border-[#5a7a52] focus:outline-none bg-white text-gray-800 text-sm resize-none"
              />
              <p className="text-xs text-gray-400 text-center">
                {isTr
                  ? "Yapay zeka girdiğiniz metni DEHB göstergeleri açısından analiz edecektir"
                  : "AI will analyze your text for ADHD indicators"}
              </p>
            </div>
          )}

          {/* Options */}
          {!isText && (
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
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "border-[#5a7a52] bg-[#5a7a52]" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                    )}
                    {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
                    <span className={`font-medium ${isSelected ? "text-[#5a7a52]" : "text-gray-600"}`}>
                      {opt.label}
                    </span>
                    {!isMulti && isSelected && <CheckCircle className="w-5 h-5 text-[#5a7a52] ml-auto" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* "Other" text input for questions with hasOther */}
          {currentQ?.hasOther && !isText && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 font-medium">
                  {isTr ? "Diğer (serbest metin)" : "Other (free text)"}
                </span>
              </div>
              <textarea
                value={otherTexts[currentQ.id] || ""}
                onChange={(e) => handleOtherText(currentQ.id, e.target.value)}
                onBlur={() => {
                  const text = otherTexts[currentQ.id];
                  if (text) evaluateOtherText(currentQ.id, text);
                }}
                placeholder={currentQ.otherPlaceholder}
                className="w-full h-20 p-3 rounded-xl border-2 border-gray-200 focus:border-[#5a7a52] focus:outline-none bg-white text-gray-800 text-sm resize-none"
              />
              {otherAnalysis[currentQ.id] && (
                <div className="mt-2 p-2 rounded-lg bg-[#5a7a52]/5 border border-[#5a7a52]/20">
                  <p className="text-xs text-[#5a7a52]">
                    {(otherAnalysis[currentQ.id] as { clinical_note?: string })?.clinical_note || ""}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(-1, step - 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-gray-500 hover:text-gray-600 hover:bg-white hover:border-gray-200 border border-transparent transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
              {isTr ? "Geri" : "Back"}
            </button>

            {(isMulti || isText || step === totalSteps - 1) && (
              <button
                onClick={handleNext}
                disabled={!canProceed() && !isText}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  canProceed() || isText
                    ? "bg-[#5a7a52] text-white hover:bg-[#4a6a44]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {step === totalSteps - 1 ? (isTr ? "Analiz Et" : "Analyze") : isTr ? "Devam" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot locale={locale} result={null} />
    </div>
  );
}
