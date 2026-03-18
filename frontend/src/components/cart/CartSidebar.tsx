"use client";

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

interface CartSidebarProps {
  messages: Record<string, string>;
}

export default function CartSidebar({ messages }: CartSidebarProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";
  const currency = locale === "tr" ? "TRY" : "USD";

  const { items, totalItems, totalTry, totalUsd, isOpen, closeCart } = useCartStore();
  const total = currency === "TRY" ? totalTry : totalUsd;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={closeCart} />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/70 backdrop-blur-sm border-l border-[#B7C396]/30 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#B7C396]/30">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#5a7a52]" />
            {messages.title} ({totalItems})
          </h2>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-[#E0E7D7]/40 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-700 font-medium">{messages.empty}</p>
              <p className="text-sm text-gray-400 mt-1">{messages.empty_desc}</p>
              <button onClick={closeCart} className="mt-6 px-5 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-[#5a7a52] hover:text-[#5a7a52] transition-colors">
                {messages.continue_shopping}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-[#E0E7D7]/60 border border-[#B7C396]/30">
                  <div className="w-20 h-20 rounded-lg bg-[#E0E7D7]/60 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product_image ? (
                      <Image src={item.product_image} alt={item.product_name} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/products/${item.product_slug}`}
                      className="text-sm font-medium text-gray-900 hover:text-[#5a7a52] line-clamp-2"
                      onClick={closeCart}
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-sm font-bold text-[#5a7a52] mt-1">
                      {formatPrice(currency === "TRY" ? item.line_total_try : item.line_total_usd, currency)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button className="p-1 hover:bg-[#E0E7D7]/40 rounded-l-lg">
                          <Minus className="w-3 h-3 text-gray-500" />
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button className="p-1 hover:bg-[#E0E7D7]/40 rounded-r-lg">
                          <Plus className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#B7C396]/30 px-6 py-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-gray-900">{messages.total}</span>
              <span className="text-[#5a7a52]">{formatPrice(total, currency)}</span>
            </div>
            <Link href={`/${locale}/checkout`} onClick={closeCart}>
              <button className="w-full py-3 bg-[#5a7a52] text-white font-semibold rounded-lg hover:bg-[#4a6a44] transition-colors">
                {messages.checkout}
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
