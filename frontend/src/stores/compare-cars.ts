import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const MAX_COMPARE = 4;

interface CompareCarsState {
  ids: number[];
  add: (id: number) => { ok: boolean; message?: string };
  remove: (id: number) => void;
  toggle: (id: number) => { ok: boolean; message?: string };
  clear: () => void;
  has: (id: number) => boolean;
  /** URL ?ids=1,2,3 senkronu (en fazla 4) */
  replaceAll: (ids: number[]) => void;
}

export const useCompareCarsStore = create<CompareCarsState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),
      add: (id) => {
        const { ids } = get();
        if (ids.includes(id)) return { ok: true };
        if (ids.length >= MAX_COMPARE) {
          return {
            ok: false,
            message: `En fazla ${MAX_COMPARE} araç karşılaştırılabilir.`,
          };
        }
        set({ ids: [...ids, id] });
        return { ok: true };
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      toggle: (id) => {
        if (get().ids.includes(id)) {
          get().remove(id);
          return { ok: true };
        }
        return get().add(id);
      },
      clear: () => set({ ids: [] }),
      replaceAll: (raw) => {
        const uniq = Array.from(new Set(raw.filter((n) => Number.isFinite(n) && n > 0)));
        set({ ids: uniq.slice(0, MAX_COMPARE) });
      },
    }),
    {
      name: "araba-iq-compare-ids",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ ids: s.ids }),
    },
  ),
);

export { MAX_COMPARE };
