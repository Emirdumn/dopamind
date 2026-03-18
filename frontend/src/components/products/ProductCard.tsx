"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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

  return (
    <div className="group bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
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
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-red-500 text-white text-xs font-bold">
            -{product.discount_percentage}%
          </span>
        )}
      </Link>

      <div className="p-5">
        {/* Rating + Price row */}
        <div className="flex items-center justify-between mb-2">
          {product.avg_rating && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= Math.round(product.avg_rating!) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                />
              ))}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-900">{formatPrice(price, currency)}</span>
        </div>

        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-[#5a7a52] transition-colors mb-1 line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.short_description}</p>

        {comparePrice && (
          <span className="text-xs text-gray-400 line-through mr-2">{formatPrice(comparePrice, currency)}</span>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#B7C396]/30">
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="text-[#5a7a52] text-sm font-medium hover:text-[#4a6a44] transition-colors"
          >
            {locale === "tr" ? `Değerlendirmeler (${product.avg_rating ? Math.round(product.avg_rating * 20) : 0})` : `Reviews (${product.avg_rating ? Math.round(product.avg_rating * 20) : 0})`}
          </Link>
          {product.is_in_stock && (
            <button
              onClick={() => onAddToCart?.(product.id)}
              className="p-2 rounded-lg bg-[#E0E7D7]/60 text-[#5a7a52] hover:bg-[#4a6a44] hover:text-white transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
