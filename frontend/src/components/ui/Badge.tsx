import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/**
 * Airbnb-inspired badge / pill chip.
 *
 * Variants mirror the system's semantic palette:
 * - `neutral`  — Canvas white with 1px Hairline border, Ink label
 * - `success` — Score Hi green on a 10% pastel fill
 * - `warning` — Score Mid amber on a 10% pastel fill
 * - `danger`  — Error Red on a 10% pastel fill
 * - `info`    — Info Blue on a 10% pastel fill
 * - `brand`   — Rausch coral on a 10% pastel fill (use sparingly; only
 *               when brand-emphasis is required and a full CTA is overkill)
 *
 * Sizes:
 * - `sm` — 11px 600, 6px × 2px padding (dense table rows, inline tags)
 * - `md` — 12px 600, 10px × 4px padding (default)
 *
 * The `uppercase` prop enables the system's only allowed caps treatment —
 * use for status labels like `NEW` or `TOP PICK`. Unless `uppercase` is
 * set, badge labels are sentence-case per the style guide.
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
  neutral: "bg-canvas text-ink border border-hairline",
  success: "bg-[rgba(34,197,94,0.10)] text-[#16a34a] border border-[rgba(34,197,94,0.20)]",
  warning: "bg-[rgba(245,158,11,0.10)] text-[#b45309] border border-[rgba(245,158,11,0.20)]",
  danger:  "bg-[rgba(193,53,21,0.08)] text-error border border-[rgba(193,53,21,0.18)]",
  info:    "bg-[rgba(66,139,255,0.10)] text-info border border-[rgba(66,139,255,0.20)]",
  brand:   "bg-[rgba(255,56,92,0.10)] text-rausch border border-[rgba(255,56,92,0.20)]",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-[11px] px-1.5 py-[2px]",
  md: "text-[12px] px-2.5 py-1",
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
        "inline-flex items-center rounded-lg font-sans font-semibold leading-none",
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
