import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface GarageVehicle {
  id: number;
  brand: string;
  model: string;
  trim: string;
  year: number;
  addedAt: number;
}

interface GarageState {
  vehicles: GarageVehicle[];
  add: (v: Omit<GarageVehicle, "addedAt">) => void;
  remove: (id: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
}

export const useGarageStore = create<GarageState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      add: (v) => {
        if (get().vehicles.some((x) => x.id === v.id)) return;
        set({ vehicles: [...get().vehicles, { ...v, addedAt: Date.now() }] });
      },
      remove: (id) => set({ vehicles: get().vehicles.filter((x) => x.id !== id) }),
      has: (id) => get().vehicles.some((x) => x.id === id),
      clear: () => set({ vehicles: [] }),
    }),
    {
      name: "araba-iq-garage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ vehicles: s.vehicles }),
    },
  ),
);
