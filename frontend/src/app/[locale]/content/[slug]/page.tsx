"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, User } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function ArticleDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href={`/${locale}/content`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {locale === "tr" ? "İçeriklere Dön" : "Back to Content"}
      </Link>

      <article>
        <Badge variant="info" className="mb-4">ADHD Bilgi</Badge>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          ADHD Nedir? Belirtileri ve Tedavi Yöntemleri
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            Dr. Ayşe Yılmaz
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            15 Mart 2026
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            1,250
          </span>
        </div>

        {/* Cover Image Placeholder */}
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-adhd-focus to-adhd-calm mb-10" />

        <div className="prose prose-lg prose-gray max-w-none">
          <p className="text-gray-600 leading-relaxed text-lg">
            {locale === "tr"
              ? "ADHD (Dikkat Eksikliği ve Hiperaktivite Bozukluğu), dünya genelinde milyonlarca insanı etkileyen nörogelişimsel bir bozukluktur. Çocukluk döneminde başlayan bu durum, yetişkinlikte de devam edebilir ve günlük yaşamı önemli ölçüde etkileyebilir."
              : "ADHD (Attention Deficit Hyperactivity Disorder) is a neurodevelopmental disorder that affects millions of people worldwide. This condition, which begins in childhood, can continue into adulthood and significantly affect daily life."}
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            {locale === "tr" ? "ADHD Belirtileri" : "ADHD Symptoms"}
          </h2>

          <ul className="space-y-3 text-gray-600">
            <li>{locale === "tr" ? "Dikkat dağınıklığı ve odaklanma güçlüğü" : "Inattention and difficulty focusing"}</li>
            <li>{locale === "tr" ? "Aşırı hareketlilik ve yerinde duramama" : "Hyperactivity and restlessness"}</li>
            <li>{locale === "tr" ? "Dürtüsellik ve sabırsızlık" : "Impulsivity and impatience"}</li>
            <li>{locale === "tr" ? "Zaman yönetimi sorunları" : "Time management issues"}</li>
            <li>{locale === "tr" ? "Organizasyon güçlüğü" : "Organizational difficulties"}</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            {locale === "tr" ? "Tedavi Yaklaşımları" : "Treatment Approaches"}
          </h2>

          <p className="text-gray-600 leading-relaxed">
            {locale === "tr"
              ? "ADHD tedavisi genellikle çok yönlü bir yaklaşım gerektirir. İlaç tedavisi, bilişsel davranışçı terapi, yaşam tarzı değişiklikleri ve destek grupları en yaygın tedavi yöntemleri arasındadır. Her bireyin ihtiyaçları farklı olduğundan, tedavi planı kişiye özel olarak hazırlanmalıdır."
              : "ADHD treatment usually requires a multifaceted approach. Medication, cognitive behavioral therapy, lifestyle changes and support groups are among the most common treatment methods. Since each individual's needs are different, the treatment plan should be tailored to the person."}
          </p>
        </div>
      </article>
    </div>
  );
}
