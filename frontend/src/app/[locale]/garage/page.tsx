"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoreVertical, GitCompare, Trash2, Plus, Car } from "lucide-react";
import { useGarageStore, type GarageVehicle } from "@/stores/garage";
import { useCompareCarsStore } from "@/stores/compare-cars";
import VehicleSelectionModal from "@/components/compare/VehicleSelectionModal";

export default function GaragePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "tr";
  const [messages, setMessages] = useState<Record<string, Record<string, string>> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    import(`@/i18n/messages/${locale}.json`).then((m) => setMessages(m.default));
  }, [locale]);

  const vehicles = useGarageStore((s) => s.vehicles);
  const removeVehicle = useGarageStore((s) => s.remove);
  const addToCompare = useCompareCarsStore((s) => s.add);

  if (!messages) return null;
  const g = messages.garage;

  const handleCompare = (v: GarageVehicle) => {
    addToCompare(v.id);
    router.push(`/${locale}/compare`);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="flex max-w-[1440px] mx-auto">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-accent px-6 py-8 sticky top-16 h-[calc(100vh-64px)]">
          <nav className="flex flex-col gap-1">
            <span className="font-heading text-[13px] font-semibold text-primary px-3 py-2 bg-surface rounded-[2px] border border-accent">
              {g.title}
            </span>
            <a
              href={`/${locale}/compare`}
              className="font-body text-[13px] text-muted px-3 py-2 hover:text-foreground transition-colors"
            >
              {messages.common.navCompare}
            </a>
            <a
              href={`/${locale}/recommendations`}
              className="font-body text-[13px] text-muted px-3 py-2 hover:text-foreground transition-colors"
            >
              {messages.common.navRecommendations}
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 lg:px-10 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-[32px] font-bold text-primary">{g.title}</h1>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="font-heading text-[14px] font-semibold bg-primary text-background h-10 px-5 rounded-[2px] hover:bg-primary-dim transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {g.emptyCta}
            </button>
          </div>

          {vehicles.length === 0 ? (
            /* Empty state */
            <div className="border border-dashed border-accent rounded-[2px] px-8 py-20 flex flex-col items-center gap-4">
              <Car className="w-10 h-10 text-muted" strokeWidth={1} />
              <p className="font-body text-[16px] text-muted">{g.empty}</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="font-heading text-[15px] font-semibold bg-primary text-background h-12 px-6 rounded-[2px] hover:bg-primary-dim transition-colors"
              >
                {g.emptyCta}
              </button>
            </div>
          ) : (
            /* Vehicle cards grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onCompare={() => handleCompare(v)}
                  onDelete={() => removeVehicle(v.id)}
                  compareLabel={g.compare}
                  deleteLabel={g.delete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <VehicleSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        locale={locale}
        onSelect={(car) => {
          useGarageStore.getState().add({
            id: car.id,
            brand: car.brand_name || "",
            model: car.model_name || "",
            trim: car.trim_name,
            year: car.year,
          });
        }}
      />
    </div>
  );
}

function VehicleCard({
  vehicle,
  onCompare,
  onDelete,
  compareLabel,
  deleteLabel,
}: {
  vehicle: GarageVehicle;
  onCompare: () => void;
  onDelete: () => void;
  compareLabel: string;
  deleteLabel: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="w-[280px] bg-surface border border-accent rounded-[2px] overflow-hidden group">
      {/* Image placeholder */}
      <div className="aspect-video bg-background flex items-center justify-center">
        <Car className="w-16 h-16 text-accent" strokeWidth={0.5} />
      </div>

      <div className="p-4 flex items-start justify-between">
        <div>
          <p className="font-heading text-[14px] font-semibold text-foreground">
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="font-body text-[12px] text-muted mt-0.5">
            {vehicle.year} · {vehicle.trim}
          </p>
        </div>

        {/* Action menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-muted hover:text-foreground transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-surface border border-accent rounded-[2px] shadow-lg min-w-[140px] z-10 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onCompare();
                }}
                className="w-full px-3 py-2 text-left font-body text-[13px] text-foreground hover:bg-accent transition-colors flex items-center gap-2"
              >
                <GitCompare className="w-3.5 h-3.5" />
                {compareLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="w-full px-3 py-2 text-left font-body text-[13px] text-score-lo hover:bg-accent transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleteLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
