"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const currency = locale === "tr" ? "TRY" : "USD";
  const { items, totalTry, totalUsd, totalItems } = useCartStore();
  const total = currency === "TRY" ? totalTry : totalUsd;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24 text-center bg-[#E0E7D7] min-h-screen">
        <ShoppingBag className="w-20 h-20 text-gray-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-[#2d3a2a] mb-2">
          {locale === "tr" ? "Sepetiniz Boş" : "Your Cart is Empty"}
        </h1>
        <p className="text-gray-600 mb-8">
          {locale === "tr"
            ? "Sepetinize henüz ürün eklemediniz."
            : "You haven't added any products to your cart yet."}
        </p>
        <Link href={`/${locale}/products`}>
          <Button size="lg">
            {locale === "tr" ? "Ürünleri Keşfet" : "Explore Products"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 bg-[#E0E7D7] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2d3a2a] mb-8">
        {locale === "tr" ? "Sepetim" : "My Cart"} ({totalItems})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30">
              <div className="w-24 h-24 rounded-xl bg-[#E0E7D7]/40 flex-shrink-0 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-600" />
              </div>
              <div className="flex-1">
                <Link href={`/${locale}/products/${item.product_slug}`} className="font-semibold text-[#2d3a2a] hover:text-[#5a7a52]">
                  {item.product_name}
                </Link>
                <p className="text-[#5a7a52] font-bold mt-1">
                  {formatPrice(currency === "TRY" ? item.price_try : item.price_usd, currency)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-[#B7C396]/30 rounded-lg">
                    <button className="p-2 hover:bg-[#E0E7D7]/40 rounded-l-lg">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium text-[#2d3a2a]">{item.quantity}</span>
                    <button className="p-2 hover:bg-[#E0E7D7]/40 rounded-r-lg">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#2d3a2a]">
                      {formatPrice(currency === "TRY" ? item.line_total_try : item.line_total_usd, currency)}
                    </span>
                    <button className="text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm border border-[#B7C396]/30 sticky top-24">
            <h2 className="text-lg font-bold text-[#2d3a2a] mb-4">
              {locale === "tr" ? "Sipariş Özeti" : "Order Summary"}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{locale === "tr" ? "Ara Toplam" : "Subtotal"}</span>
                <span className="font-medium text-[#2d3a2a]">{formatPrice(total, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{locale === "tr" ? "Kargo" : "Shipping"}</span>
                <span className="font-medium text-[#5a7a52]">{locale === "tr" ? "Ücretsiz" : "Free"}</span>
              </div>
              <div className="pt-3 border-t border-[#B7C396]/30 flex justify-between text-lg font-bold text-[#2d3a2a]">
                <span>{locale === "tr" ? "Toplam" : "Total"}</span>
                <span className="text-[#5a7a52]">{formatPrice(total, currency)}</span>
              </div>
            </div>
            <Link href={`/${locale}/checkout`} className="block mt-6">
              <Button size="lg" className="w-full">
                {locale === "tr" ? "Ödemeye Geç" : "Proceed to Checkout"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
