"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const ADHD_TAGS: Record<string, { label: string; color: string }> = {
  focus: { label: "Focus", color: "bg-blue-100 text-blue-700" },
  calm: { label: "Calm", color: "bg-purple-100 text-purple-700" },
  organization: { label: "Organization", color: "bg-orange-100 text-orange-700" },
};

function getAdhdTag(slug: string): { label: string; color: string } {
  const focusKeywords = ["earbuds", "noise", "timer", "pomodoro", "white-noise", "gurultu", "kulaklik", "fidget"];
  const calmKeywords = ["glasses", "gozluk", "weighted", "agirlikli", "sleep", "uyku", "calm"];
  const orgKeywords = ["planner", "organizer", "desk", "masa", "duzenleyici"];

  const s = slug.toLowerCase();
  if (orgKeywords.some((k) => s.includes(k))) return ADHD_TAGS.organization;
  if (calmKeywords.some((k) => s.includes(k))) return ADHD_TAGS.calm;
  if (focusKeywords.some((k) => s.includes(k))) return ADHD_TAGS.focus;
  return ADHD_TAGS.focus;
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    short_description: string;
    product_type: string;
    price_try: string;
    price_usd: string;
    compare_at_price_try: string | null;
    compare_at_price_usd: string | null;
    primary_image: { image: string; alt_text: string } | null;
    is_featured: boolean;
    is_in_stock: boolean;
    discount_percentage: number;
    avg_rating: number | null;
  };
  locale: string;
  currency?: string;
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, locale, currency = "TRY", onAddToCart }: ProductCardProps) {
  const price = currency === "TRY" ? product.price_try : product.price_usd;
  const comparePrice = currency === "TRY" ? product.compare_at_price_try : product.compare_at_price_usd;
  const tag = getAdhdTag(product.slug);
  const isTr = locale === "tr";

  return (
    <div className="group bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300 border border-[#B7C396]/30">
      <Link href={`/${locale}/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#E0E7D7]/60">
        {product.primary_image ? (
          <Image
            src={product.primary_image.image}
            alt={product.primary_image.alt_text || product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}
        {product.discount_percentage > 0 && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-red-500 text-white text-xs font-bold">
            -{product.discount_percentage}%
          </span>
        )}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${tag.color}`}>
          {tag.label}
        </span>
      </Link>

      <div className="p-5">
        {product.avg_rating && (
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${star <= Math.round(product.avg_rating!) ? "text-yellow-500 fill-yellow-500" : "text-[#B7C396]/40"}`}
              />
            ))}
            <span className="text-xs text-[#6b7f65] ml-1">{product.avg_rating.toFixed(1)}</span>
          </div>
        )}

        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="font-semibold text-[#2d3a2a] group-hover:text-[#5a7a52] transition-colors mb-1 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-[#6b7f65] line-clamp-2 mb-3 leading-relaxed">{product.short_description}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-[#2d3a2a]">{formatPrice(price, currency)}</span>
          {comparePrice && (
            <span className="text-sm text-[#B7C396] line-through">{formatPrice(comparePrice, currency)}</span>
          )}
        </div>

        {product.is_in_stock && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product.id);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5a7a52] text-white text-sm font-semibold rounded-lg hover:bg-[#4a6a44] transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {isTr ? "Sepete Ekle" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}
