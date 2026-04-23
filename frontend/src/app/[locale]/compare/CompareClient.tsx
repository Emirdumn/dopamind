"use client";

import { useEffect, useState, useCallback, useMemo, Fragment } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, X, Plus, Check, Minus, ChevronDown } from "lucide-react";
import { postCompare } from "@/lib/araba-iq-client";
import type { CarCompareResponse } from "@/lib/araba-iq-client";
import { useCompareCarsStore, MAX_COMPARE } from "@/stores/compare-cars";
import { getArabaIqMessages } from "@/lib/araba-iq-messages";
import { humanizeArabaIqError } from "@/lib/humanize-araba-iq-error";
import { buildCompareHighlights } from "@/lib/compare-highlights";
import { formatCellValue } from "@/lib/format-scores";
import { interpolate } from "@/lib/interpolate";
import {
  equipmentRowHasDifference,
  countUniqueEquipmentAdvantages,
  uniqueEquipmentCategories,
  type EquipmentRow,
} from "@/lib/compare-equipment";
import {
  technicalBalancedLeader,
  performancePowerLeader,
  marketPriceLeader,
  equipmentRichLeader,
  type TabLeaderResult,
} from "@/lib/compare-tab-leaders";
import { computeTopPick, type TopPickResult } from "@/lib/compare-top-pick";
import { segmentLabel } from "@/lib/segment-catalog";
import VehicleSelectionModal from "@/components/compare/VehicleSelectionModal";
import CarHeroImage from "@/components/compare/CarHeroImage";
import Laurel from "@/components/compare/Laurel";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════════════
   Apple-style vertical comparison — Midnight Showroom edition.

   The old layout used tab navigation and horizontal pivot tables. We're
   replacing that with a single long vertical scroll modeled after Apple's
   iPhone compare page:

     ┌──────┬─────────────┬─────────────┬─────────────┐
     │      │ [Change ▼]  │ [Change ▼]  │ [Change ▼]  │  <- column head
     │      │  <CAR PIC>  │  <CAR PIC>  │  <CAR PIC>  │
     │      │  Brand /    │  Brand /    │  Brand /    │
     │      │  Model      │  Model      │  Model      │
     ├──────┴─────────────┴─────────────┴─────────────┤
     │   ── Performance ──                            │  <- section band
     ├──────┬─────────────┬─────────────┬─────────────┤
     │ 0-100│ 7.6s        │ 9.2s        │ 9.9s        │  <- spec row
     │ HP   │ 170         │ 158         │ 140         │
     │ ...  │             │             │             │
     ├──────┴─────────────┴─────────────┴─────────────┤
     │   ── Technical ──                              │
     ├──────┬─────────────┬─────────────┬─────────────┤
     │ ...                                            │

   All columns live in one CSS Grid with a shared `gridTemplateColumns`, so
   values align pixel-perfect across every section. Section headers and
   leader cards use `col-span-full` to bridge the grid without disturbing
   the column widths. No 1px borders — tonal shifts alone define rows
   (doc §2 "No-Line Rule").
   ════════════════════════════════════════════════════════════════════════ */

/** Small inline "who's leading this section" card shown above spec grids. */
function LeaderCard({ leader }: { leader: TabLeaderResult }) {
  return (
    <div className="col-span-full mb-3 rounded-lg bg-surface-container-low px-5 py-4">
      <p className="superscript text-on-surface-variant mb-1">{leader.headline}</p>
      <p className="font-heading text-[20px] font-semibold text-on-surface tracking-[-0.018em]">
        {leader.leaderShortName}
      </p>
      <p className="font-sans text-[14px] font-medium text-on-surface-variant mt-1">
        {leader.detail}
      </p>
    </div>
  );
}

/**
 * ArabaIQ Top Pick — Guest-Favorite-style lockup with Midnight Showroom skin.
 * Centered laurel-wrapped numeric moment, floats over a primary radial
 * light-bleed (doc §4). Spans full width above the vertical compare grid.
 */
function TopPickLockup({
  pick,
  badge,
  subtitlePattern,
  dimensionsLabel,
}: {
  pick: TopPickResult;
  badge: string;
  subtitlePattern: string;
  dimensionsLabel: string;
}) {
  return (
    <section
      aria-label={badge}
      className="relative mb-10 flex flex-col items-center text-center py-10 overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 light-bleed-strong pointer-events-none" />

      <div className="relative flex items-end justify-center gap-2 text-primary">
        <Laurel size={64} />
        <span
          className="font-heading font-bold text-on-surface tabular leading-none"
          style={{ fontSize: 72, letterSpacing: "-0.028em" }}
        >
          {pick.wins}
        </span>
        <Laurel size={64} mirror />
      </div>

      <p className="superscript text-primary mt-5 relative">{badge}</p>

      <h3 className="relative font-heading text-[24px] font-semibold text-on-surface mt-2 tracking-[-0.02em]">
        {pick.leaderShortName}
      </h3>

      <p className="relative font-sans text-[14px] font-medium text-on-surface-variant mt-1.5">
        {interpolate(subtitlePattern, { wins: pick.wins, total: pick.totalDimensions })}
      </p>

      <p className="relative font-sans text-[12px] font-medium text-mute mt-1">
        <span className="sr-only">{dimensionsLabel}: </span>
        {pick.dimensionsWon.join(" · ")}
      </p>
    </section>
  );
}

/* ─────────────────────── Sub-components within the grid ─────────────── */

type CarBlock = CarCompareResponse["cars"][number];

/**
 * Column header — "Change" dropdown + hero image + name block.
 * Rendered as a single grid cell whose height adapts to the tallest sibling
 * in the header row. Hover surfaces a "Remove" affordance.
 */
function ColumnHeader({
  car,
  isPick,
  topPickLabel,
  changeLabel,
  removeLabel,
  segmentLabelText,
  onChange,
  onRemove,
}: {
  car: CarBlock;
  isPick: boolean;
  topPickLabel: string;
  changeLabel: string;
  removeLabel: string;
  segmentLabelText: string;
  onChange: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-lg p-4 transition duration-300 group",
        isPick ? "bg-surface-container-high shadow-glow" : "bg-surface-container-low",
      )}
    >
      {/* Top bar: Change dropdown (left) + Remove (right, hover-revealed) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onChange}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-surface-container/60 hover:bg-surface-container-highest font-sans text-[11px] font-semibold tracking-[0.04em] uppercase text-on-surface-variant hover:text-on-surface transition duration-300"
        >
          {changeLabel}
          <ChevronDown size={12} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-surface-container-highest transition duration-300"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Hero image — brand-tinted gradient fallback if no /cars/ asset */}
      <CarHeroImage brand={car.brand} model={car.model} alt={car.display_name} />

      {/* Name block */}
      <div className="px-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="superscript text-on-surface-variant">{segmentLabelText}</p>
          {isPick && (
            <span aria-label={topPickLabel} className="superscript text-primary">
              Top Pick
            </span>
          )}
        </div>
        <h3 className="font-heading text-[17px] font-bold text-on-surface leading-tight tracking-[-0.018em] mt-1">
          {car.brand} {car.model}
        </h3>
        <p className="font-sans text-[12px] font-medium text-on-surface-variant mt-1 truncate">
          {car.year} · {car.trim_name}
        </p>
      </div>
    </div>
  );
}

/**
 * Section title band — spans all columns, uses surface-container-high to
 * create a one-step-up tonal lift that separates sections without a border.
 */
function SectionBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full mt-12 mb-4">
      <h3 className="font-heading text-[22px] font-semibold text-on-surface tracking-[-0.02em]">
        {children}
      </h3>
    </div>
  );
}

/* ═════════════════════════════ Main client ═════════════════════════════ */

export default function CompareClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "tr";
  const ai = getArabaIqMessages(locale);
  const t = ai.compare;

  const ids = useCompareCarsStore((s) => s.ids);
  const remove = useCompareCarsStore((s) => s.remove);
  const clear = useCompareCarsStore((s) => s.clear);
  const replaceAll = useCompareCarsStore((s) => s.replaceAll);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CarCompareResponse | null>(null);
  const [equipmentOnlyDiff, setEquipmentOnlyDiff] = useState(false);
  const [equipmentCategory, setEquipmentCategory] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  // ── Sync ?ids=1,2,3 URL param into the store on mount ─────────────────
  useEffect(() => {
    const raw = searchParams.get("ids");
    if (!raw) return;
    const parsed = raw
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (parsed.length >= 2) replaceAll(parsed);
  }, [searchParams, replaceAll]);

  const runCompare = useCallback(async () => {
    if (ids.length < 2) {
      setResult(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await postCompare(ids.slice(0, MAX_COMPARE));
      setResult(res);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "err";
      setError(humanizeArabaIqError(raw, ai.errors));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [ids, ai.errors]);

  useEffect(() => {
    if (ids.length >= 2) runCompare();
    else {
      setResult(null);
      setError(null);
    }
  }, [ids, runCompare]);

  // ── Derived data ──────────────────────────────────────────────────────
  const equipment = result?.equipment_comparison as
    | { rows?: EquipmentRow[]; truthy_counts_by_variant_id?: Record<string, number> }
    | undefined;

  const carIds = useMemo(
    () => (result ? result.cars.map((c) => c.car_variant_id) : []),
    [result],
  );

  const equipmentRows: EquipmentRow[] = useMemo(() => equipment?.rows ?? [], [equipment?.rows]);

  const equipmentAdvantageCount = useMemo(
    () =>
      equipmentRows.length && carIds.length >= 2
        ? countUniqueEquipmentAdvantages(equipmentRows, carIds)
        : 0,
    [equipmentRows, carIds],
  );

  const equipmentCategories = useMemo(() => uniqueEquipmentCategories(equipmentRows), [equipmentRows]);

  const filteredEquipmentRows = useMemo(() => {
    let rows = equipmentRows;
    if (equipmentCategory) rows = rows.filter((row) => row.category === equipmentCategory);
    if (equipmentOnlyDiff) rows = rows.filter((row) => equipmentRowHasDifference(row, carIds));
    return rows;
  }, [equipmentRows, equipmentCategory, equipmentOnlyDiff, carIds]);

  const techLeader = useMemo(
    () => (result && result.cars.length >= 2 ? technicalBalancedLeader(result, t) : null),
    [result, t],
  );
  const perfLeader = useMemo(
    () => (result && result.cars.length >= 2 ? performancePowerLeader(result, t, locale) : null),
    [result, t, locale],
  );
  const marketLeader = useMemo(
    () => (result && result.cars.length >= 2 ? marketPriceLeader(result, t, locale) : null),
    [result, t, locale],
  );
  const equipLeader = useMemo(
    () => (result && result.cars.length >= 2 ? equipmentRichLeader(result, t, locale) : null),
    [result, t, locale],
  );

  const topPick = useMemo(() => (result ? computeTopPick(result, t, locale) : null), [result, t, locale]);

  const highlights =
    result && result.cars.length >= 2
      ? buildCompareHighlights(
          result,
          {
            fuel: t.highlightFuel,
            luggage: t.highlightLuggage,
            priceLow: t.highlightPrice,
            equipment: t.highlightEquipment,
          },
          locale,
        )
      : [];

  // ── Grid column template — shared across all sections so columns align
  //    pixel-perfect top-to-bottom. `minmax(…, 1fr)` lets wider screens
  //    breathe; narrower ones kick in horizontal scroll via the wrapper. ──
  const nCols = result?.cars.length ?? 0;
  const gridTemplate =
    nCols > 0
      ? `minmax(170px, 220px) repeat(${nCols}, minmax(220px, 1fr))`
      : undefined;

  /**
   * Render a key-value spec block (performance / technical / market) as a
   * sequence of grid rows. Each row is: label cell + N value cells.
   */
  const renderSpecRows = (data: Record<string, Record<string, unknown>>) => {
    if (!result) return null;
    const keys = Object.keys(data);
    return keys.map((key, i) => {
      const stripe = i % 2 === 1;
      const rowBg = stripe ? "bg-surface-container" : "bg-surface-container-low";
      return (
        <Fragment key={key}>
          <div
            className={cn(
              "px-5 py-4 font-sans text-[12.5px] font-semibold tracking-[0.01em] text-on-surface-variant self-center",
              rowBg,
              i === 0 && "rounded-tl-lg",
              i === keys.length - 1 && "rounded-bl-lg",
            )}
          >
            {key}
          </div>
          {result.cars.map((c, idx) => {
            const v = data[key]?.[String(c.car_variant_id)];
            return (
              <div
                key={c.car_variant_id}
                className={cn(
                  "px-5 py-4 font-sans text-[14px] font-semibold text-on-surface tabular self-center",
                  rowBg,
                  i === 0 && idx === nCols - 1 && "rounded-tr-lg",
                  i === keys.length - 1 && idx === nCols - 1 && "rounded-br-lg",
                )}
              >
                {formatCellValue(v) || t.emptyCell}
              </div>
            );
          })}
        </Fragment>
      );
    });
  };

  /** Meta rows that come directly off the `CompareCarBlock` header (not the
   *  `*_comparison` dicts). Year, trim, segment — gives the "overview" band
   *  at the top of the grid just under the column headers. */
  const renderOverviewRows = () => {
    if (!result) return null;
    const rows: Array<{ label: string; pick: (c: CarBlock) => string }> = [
      { label: t.columnSegment, pick: (c) => segmentLabel(c.segment, locale) || c.segment },
      { label: t.columnYear, pick: (c) => String(c.year) },
      { label: t.columnTrim, pick: (c) => c.trim_name },
    ];
    return rows.map((row, i) => {
      const stripe = i % 2 === 1;
      const rowBg = stripe ? "bg-surface-container" : "bg-surface-container-low";
      return (
        <Fragment key={row.label}>
          <div
            className={cn(
              "px-5 py-4 font-sans text-[12.5px] font-semibold tracking-[0.01em] text-on-surface-variant self-center",
              rowBg,
              i === 0 && "rounded-tl-lg",
              i === rows.length - 1 && "rounded-bl-lg",
            )}
          >
            {row.label}
          </div>
          {result.cars.map((c, idx) => (
            <div
              key={c.car_variant_id}
              className={cn(
                "px-5 py-4 font-sans text-[14px] font-semibold text-on-surface self-center",
                rowBg,
                i === 0 && idx === nCols - 1 && "rounded-tr-lg",
                i === rows.length - 1 && idx === nCols - 1 && "rounded-br-lg",
              )}
            >
              {row.pick(c) || t.emptyCell}
            </div>
          ))}
        </Fragment>
      );
    });
  };

  /**
   * Equipment rows are yes/no, with a category grouping header. Rendered
   * into the same grid so the column widths stay aligned with the rest of
   * the spec sections.
   */
  const renderEquipmentRows = () => {
    if (!result) return null;
    const rows = filteredEquipmentRows;
    if (!rows.length) {
      return (
        <div className="col-span-full rounded-lg bg-surface-container-low px-6 py-10 text-center font-sans text-[14px] font-medium text-on-surface-variant">
          {t.equipmentEmptyFiltered}
        </div>
      );
    }
    return rows.map((row, i) => {
      const stripe = i % 2 === 1;
      const rowBg = stripe ? "bg-surface-container" : "bg-surface-container-low";
      return (
        <Fragment key={`${row.category}-${row.feature}-${i}`}>
          <div
            className={cn(
              "px-5 py-4 self-center",
              rowBg,
              i === 0 && "rounded-tl-lg",
              i === rows.length - 1 && "rounded-bl-lg",
            )}
          >
            <p className="superscript text-on-surface-variant">{row.category}</p>
            <p className="font-sans text-[13px] font-semibold text-on-surface mt-1">{row.feature}</p>
          </div>
          {result.cars.map((c, idx) => {
            const v = row.by_variant_id[String(c.car_variant_id)];
            const yes = v === true;
            const no = v === false;
            return (
              <div
                key={c.car_variant_id}
                className={cn(
                  "px-5 py-4 self-center flex items-center justify-center",
                  rowBg,
                  i === 0 && idx === nCols - 1 && "rounded-tr-lg",
                  i === rows.length - 1 && idx === nCols - 1 && "rounded-br-lg",
                )}
              >
                {yes ? (
                  <span
                    aria-label={t.yes}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full primary-gradient text-white shadow-pop"
                  >
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                ) : no ? (
                  <span
                    aria-label={t.no}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface-container-high text-mute"
                  >
                    <Minus className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                ) : (
                  <span className="text-outline-variant">—</span>
                )}
              </div>
            );
          })}
        </Fragment>
      );
    });
  };

  return (
    <div className="bg-canvas px-4 sm:px-6 lg:px-10 pt-8 pb-20 min-h-screen">
      <div className="max-w-[1280px] mx-auto w-full min-w-0">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="font-heading text-display-sm text-on-surface tracking-[-0.02em]">
            {t.title}
          </h1>
          {ids.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="mt-2 font-sans text-[13px] font-medium text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              {t.clear}
            </button>
          )}
        </header>

        {/* ── Empty / one-car / error states ────────────────────────────── */}
        {ids.length === 0 && (
          <div className="rounded-xl bg-surface-container-low px-8 py-20 flex flex-col items-center gap-6">
            <p className="font-heading text-[18px] font-semibold text-on-surface text-center tracking-[-0.01em]">
              {t.needTwo}
            </p>
            <Button variant="primary" size="lg" onClick={() => setModalOpen(true)}>
              {t.addVehicle}
            </Button>
          </div>
        )}

        {ids.length === 1 && !loading && (
          <div className="rounded-lg bg-surface-container-low px-6 py-6 mb-8">
            <p className="font-heading text-[18px] font-semibold text-on-surface tracking-[-0.01em]">
              {t.oneCarTitle}
            </p>
            <p className="font-sans text-[14px] font-medium text-on-surface-variant mt-2">
              {t.oneCarBody}
            </p>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
                {t.addAnother}
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-on-surface-variant mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="font-sans text-[14px] font-medium">{t.loading}</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-error-container px-4 py-3 font-sans text-[14px] font-medium text-error-on-container mb-8">
            {error}
          </div>
        )}

        {/* ── Overview strip (top pick + narrative) ─────────────────────── */}
        {result && !loading && (
          <>
            {topPick && (
              <TopPickLockup
                pick={topPick}
                badge={t.topPickBadge}
                subtitlePattern={t.topPickSubtitle}
                dimensionsLabel={t.topPickDimensions}
              />
            )}

            {result.summary_comments.length > 0 && (
              <section className="mb-12">
                <h2 className="font-heading text-[20px] font-semibold text-on-surface mb-5 tracking-[-0.018em]">
                  {t.summaryNarrative}
                </h2>
                <ul className="space-y-3 max-w-[860px]">
                  {result.summary_comments.map((line, i) => (
                    <li
                      key={i}
                      className="flex gap-3 font-sans text-[14px] font-medium text-on-surface leading-relaxed"
                    >
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 w-6 h-6 rounded-full primary-gradient text-white text-[11px] font-bold flex items-center justify-center tabular shadow-pop"
                      >
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {highlights.length > 0 && (
              <section className="mb-14">
                <h2 className="font-heading text-[20px] font-semibold text-on-surface mb-5 tracking-[-0.018em]">
                  {t.summaryHighlights}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {highlights.map((h) => (
                    <div
                      key={h.areaKey}
                      className="rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors duration-300 p-4"
                    >
                      <p className="superscript text-on-surface-variant mb-1.5">{h.label}</p>
                      <p className="font-heading text-[16px] font-semibold text-on-surface tracking-[-0.015em]">
                        {h.leaderShortName}
                      </p>
                      <p className="font-sans text-[12.5px] font-medium text-on-surface-variant mt-1">
                        {h.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Apple-style vertical comparison grid ─────────────────── */}
            <div className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
              <div
                className="min-w-fit grid gap-x-3 gap-y-1 items-stretch"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {/* ── Header row: empty cell + N column headers ──────── */}
                <div aria-hidden="true" />
                {result.cars.map((c) => {
                  const isPick = topPick?.leaderCarId === c.car_variant_id;
                  return (
                    <ColumnHeader
                      key={c.car_variant_id}
                      car={c}
                      isPick={isPick}
                      topPickLabel={t.topPickBadge}
                      changeLabel={t.columnChange}
                      removeLabel={t.columnRemove}
                      segmentLabelText={segmentLabel(c.segment, locale) || c.segment}
                      onChange={() => {
                        remove(c.car_variant_id);
                        setModalOpen(true);
                      }}
                      onRemove={() => remove(c.car_variant_id)}
                    />
                  );
                })}

                {/* Add-column tile appears inline when under the cap */}
                {result.cars.length < MAX_COMPARE && (
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="rounded-lg ghost-border flex flex-col items-center justify-center gap-2 px-4 py-8 min-h-[280px] text-on-surface-variant hover:text-primary transition duration-300"
                  >
                    <Plus className="w-5 h-5" strokeWidth={1.75} />
                    <span className="font-sans text-[13px] font-semibold">{t.addVehicle}</span>
                  </button>
                )}

                {/* ── Overview section ────────────────────────────────── */}
                <SectionBand>{t.sectionOverview}</SectionBand>
                {renderOverviewRows()}

                {/* ── Performance ─────────────────────────────────────── */}
                <SectionBand>{t.sectionPerformance}</SectionBand>
                {perfLeader && <LeaderCard leader={perfLeader} />}
                {renderSpecRows(result.performance_comparison as Record<string, Record<string, unknown>>)}

                {/* ── Technical ──────────────────────────────────────── */}
                <SectionBand>{t.sectionTechnical}</SectionBand>
                {techLeader && <LeaderCard leader={techLeader} />}
                {renderSpecRows(result.technical_comparison as Record<string, Record<string, unknown>>)}

                {/* ── Market ─────────────────────────────────────────── */}
                <SectionBand>{t.sectionMarket}</SectionBand>
                {marketLeader && <LeaderCard leader={marketLeader} />}
                {renderSpecRows(result.market_comparison as Record<string, Record<string, unknown>>)}

                {/* ── Equipment ───────────────────────────────────────── */}
                {equipment?.rows && equipment.rows.length > 0 && (
                  <>
                    <SectionBand>{t.sectionEquipment}</SectionBand>

                    {/* Equipment filter row — spans all columns */}
                    <div className="col-span-full mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between rounded-lg bg-surface-container-low px-4 py-3">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="font-sans text-[13px] font-medium text-on-surface-variant">
                          {interpolate(t.equipmentSummary, {
                            cars: result.cars.length,
                            advantages: equipmentAdvantageCount,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <label className="inline-flex items-center gap-2 font-sans text-[13px] font-medium text-on-surface cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={equipmentOnlyDiff}
                            onChange={(e) => setEquipmentOnlyDiff(e.target.checked)}
                            className="rounded-sm border-outline-variant text-primary focus:ring-primary"
                          />
                          {t.equipmentOnlyDiff}
                        </label>
                        <select
                          value={equipmentCategory}
                          onChange={(e) => setEquipmentCategory(e.target.value)}
                          className="font-sans text-[13px] font-medium rounded-md bg-surface-container px-3 py-2 text-on-surface focus:outline-none focus:shadow-focus duration-300"
                        >
                          <option value="">{t.equipmentCategoryAll}</option>
                          {equipmentCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {equipLeader && <LeaderCard leader={equipLeader} />}

                    {renderEquipmentRows()}

                    {/* Truthy-count footer row — spans all cars */}
                    {equipment.truthy_counts_by_variant_id && (
                      <>
                        <div className="px-5 py-4 rounded-bl-lg bg-surface-container-highest font-sans text-[11px] font-semibold text-on-surface uppercase tracking-[0.06em] self-center">
                          {t.truthyCount}
                        </div>
                        {result.cars.map((c, idx) => (
                          <div
                            key={c.car_variant_id}
                            className={cn(
                              "px-5 py-4 bg-surface-container-highest font-heading text-[16px] font-bold text-on-surface tabular self-center text-center",
                              idx === nCols - 1 && "rounded-br-lg",
                            )}
                          >
                            {equipment.truthy_counts_by_variant_id?.[String(c.car_variant_id)] ?? "—"}
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <VehicleSelectionModal open={modalOpen} onClose={() => setModalOpen(false)} locale={locale} />
    </div>
  );
}
