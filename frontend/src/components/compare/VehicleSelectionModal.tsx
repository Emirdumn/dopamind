"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { fetchCars, type CarVariantListItem } from "@/lib/araba-iq-client";
import { useCompareCarsStore } from "@/stores/compare-cars";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  locale: string;
  /** If provided, called instead of the default add-to-compare + navigate behavior */
  onSelect?: (car: CarVariantListItem) => void;
}

export default function VehicleSelectionModal({ open, onClose, locale, onSelect }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CarVariantListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const addCar = useCompareCarsStore((s) => s.add);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSearched(false);
      setHighlightIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const items = await fetchCars(q.trim());
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const selectCar = useCallback(
    (car: CarVariantListItem) => {
      if (onSelect) {
        onSelect(car);
      } else {
        addCar(car.id);
        router.push(`/${locale}/compare`);
      }
      onClose();
    },
    [addCar, onClose, router, locale, onSelect],
  );

  if (!open) return null;

  const isTr = locale === "tr";
  const placeholder = isTr ? "Marka veya model ara..." : "Search brand or model...";
  const noResults = isTr ? "Sonuç bulunamadı" : "No results found";
  const closeLabel = isTr ? "Kapat" : "Close";
  const headingLabel = isTr ? "Araç ekle" : "Add vehicle";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[10vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label={headingLabel}
      onClick={onClose}
    >
      {/* Backdrop — deep tonal void, never a solid neutral grey. */}
      <div className="absolute inset-0 bg-surface-container-lowest/85 backdrop-blur-sm animate-fade-in" />

      {/* Modal panel — surface-container-highest, the most prominent floating
          element per doc §2. No border, ambient tinted shadow instead. */}
      <div
        className={cn(
          "relative w-full max-w-[620px] max-h-[80vh] flex flex-col",
          "bg-surface-container-highest rounded-xl shadow-lift animate-fade-in",
          "overflow-hidden",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: search input with bottom ghost border (doc §5 Input spec) */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid rgba(67, 71, 88, 0.22)" }}
        >
          <Search className="w-5 h-5 text-on-surface-variant shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightIdx(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightIdx((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && highlightIdx >= 0 && results[highlightIdx]) {
                selectCar(results[highlightIdx]);
              }
            }}
            placeholder={placeholder}
            className="flex-1 h-11 bg-transparent text-on-surface font-sans text-[16px] font-medium placeholder:text-mute outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition duration-300"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Results list — no row dividers. Zebra via surface shift on hover. */}
        <div className="overflow-y-auto flex-1 py-1">
          {loading && (
            <div className="flex flex-col">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 px-5 flex items-center">
                  <div
                    className="h-3 rounded-sm animate-shimmer"
                    style={{
                      width: `${140 + i * 30}px`,
                      backgroundImage:
                        "linear-gradient(90deg, #1f2539 25%, #2e3447 50%, #1f2539 75%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <span className="font-sans text-[14px] font-medium text-on-surface-variant">{noResults}</span>
            </div>
          )}

          {!loading && !searched && (
            <div className="flex items-center justify-center h-32 px-6">
              <span className="font-sans text-[13px] font-medium text-mute text-center">
                {isTr
                  ? "Aramaya başlamak için marka veya model yazın."
                  : "Start typing a brand or model to search."}
              </span>
            </div>
          )}

          {!loading &&
            results.map((car, idx) => {
              const displayName = [car.brand_name, car.model_name, car.trim_name]
                .filter(Boolean)
                .join(" ");
              const meta = [car.year, car.fuel_type].filter(Boolean).join(" · ");
              const isHighlighted = idx === highlightIdx;

              return (
                <button
                  key={car.id}
                  type="button"
                  onClick={() => selectCar(car)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  className={cn(
                    "w-full px-5 py-3 flex items-center justify-between gap-4",
                    "transition duration-300 text-left",
                    isHighlighted
                      ? "bg-surface-container-high text-primary"
                      : "text-on-surface hover:bg-surface-container-high hover:text-primary",
                  )}
                >
                  <span className="font-sans text-[14px] font-medium truncate">
                    {displayName}
                  </span>
                  {meta && (
                    <span className="font-sans text-[13px] font-medium text-on-surface-variant shrink-0 tabular">
                      {meta}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
