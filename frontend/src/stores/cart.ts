import { create } from "zustand";

interface CartItem {
  id: string;
  product: string;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  quantity: number;
  price_try: string;
  price_usd: string;
  line_total_try: string;
  line_total_usd: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalTry: string;
  totalUsd: string;
  isOpen: boolean;
  setCart: (data: { items: CartItem[]; total_items: number; total_try: string; total_usd: string }) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalItems: 0,
  totalTry: "0",
  totalUsd: "0",
  isOpen: false,
  setCart: (data) =>
    set({
      items: data.items,
      totalItems: data.total_items,
      totalTry: data.total_try,
      totalUsd: data.total_usd,
    }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
