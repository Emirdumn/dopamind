import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/**
 * Midnight Showroom chip / badge (design doc §5).
 *
 * All variants share the same "action chip" geometry: full (9999px)
 * roundedness, `secondary-container` family fills, on-container foreground.
 * The contrast with the MD3 xl (12px) card radius is intentional and
 * documented in the doc.
 *
 * Variants (semantic families):
 * - `neutral`  — Standard action chip. `secondary-container` fill +
 *                `on-secondary-container` label. The default lookup.
 * - `success` — Score-hi tint @ 16% + score-hi text. Semantic exception
 *                (doc: "At-a-glance data legibility").
 * - `warning` — Score-mid tint + score-mid text. Same exception.
 * - `danger`  — MD3 `error-container` + `on-error-container` label.
 * - `info`    — Tertiary indigo tint + tertiary text (soft violet, never
 *                competes with primary).
 * - `brand`   — Primary tint @ 16% + primary text. Reserved for moments
 *                that need to echo the primary CTA (Top Pick superscript,
 *                "Recommended" flag) without stealing the CTA's fill.
 *
 * Sizes:
 * - `sm` — 11px 600, 6px × 2px padding (dense table rows, inline tags)
 * - `md` — 12px 600, 10px × 4px padding (default)
 *
 * The `uppercase` prop enables the system's only allowed caps treatment —
 * use for status labels (`NEW`, `TOP PICK`). Badge labels are sentence-case
 * by default.
 */
type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info" | "brand";
type BadgeSize    = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?:    BadgeSize;
  uppercase?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-secondary-container text-secondary-on-container",
  success: "bg-[rgba(34,197,94,0.16)] text-[var(--c-score-hi)]",
  warning: "bg-[rgba(245,158,11,0.16)] text-[var(--c-score-mid)]",
  danger:  "bg-error-container text-error-on-container",
  info:    "bg-[rgba(221,187,255,0.16)] text-tertiary",
  brand:   "bg-[rgba(192,193,255,0.16)] text-primary",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-[11px] px-2 py-[2px]",
  md: "text-[12px] px-3 py-1",
};

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  uppercase = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-sans font-semibold leading-none",
        uppercase && "uppercase tracking-[0.32px]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type { BadgeProps, BadgeVariant, BadgeSize };
