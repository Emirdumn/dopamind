"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

/**
 * Midnight Showroom — "Showroom Card" primitive (design doc §5).
 *
 * The signature frame for car photography and editorial specs. Rules
 * encoded from the doc:
 *   • **No divider lines.** Internal sectioning is done with whitespace
 *     or a one-tier surface-ladder shift (never a 1px border).
 *   • **Background:** `surface-container-low` (#10182b) by default.
 *   • **Radius:** MD3 xl (12px) — matches the primary CTA so cards and
 *     buttons share the same structural grammar (doc §6).
 *   • **Hover (interactive/showroom):** background lifts to
 *     `surface-container-high` and the "Ghost Border" warms with a
 *     primary glow via `shadow-glow` (1px rgba(192,193,255,.22) inset
 *     + 8/32 diffused LED bloom) — doc §5 interaction.
 *   • **Ambient shadow:** the floating variant uses the tinted 40–60px
 *     `shadow-ambient` stack — never a default Material Design drop
 *     shadow (doc §4, Don't #2).
 *   • **Light bleed:** opt-in radial `primary` @ 5–8% behind content
 *     simulates a soft spotlight on the subject (doc §4).
 *
 * ## Variants
 * - `default`     — static surface. Use for content panels that should
 *                   not invite interaction (summary stats, metadata).
 * - `interactive` — clickable surface with full hover treatment. Use
 *                   for list-row cards that open a detail view.
 * - `floating`    — highest elevation (container-high baseline + ambient
 *                   shadow). Use for modals, overlays, and sticky panels.
 * - `showroom`    — the editorial hero: container-low baseline, hover
 *                   lifts with glow and optional light-bleed. Reserved
 *                   for car hero cards and "Top Pick" moments.
 *
 * ## Padding
 * Defaults to `md` (24px) which is the doc's canonical internal gap for
 * image → specs separation. Use `none` when embedding an edge-to-edge
 * hero image; a child `<div>` can then set its own padding.
 *
 * ## Composition
 * Consumers are expected to lay out their own internal structure
 * (image, title, specs, CTAs) using flex/grid + the 24px gap from the
 * spacing scale. No `CardHeader` / `CardFooter` slots are provided: the
 * card is intentionally primitive so the editorial layout can break the
 * template look (doc §1 "Intentional Asymmetry").
 */

type CardVariant = "default" | "interactive" | "floating" | "showroom";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  /**
   * Renders a faint primary radial gradient behind the card content
   * (doc §4 "Light Bleed"). Recommended with `variant="showroom"` when
   * the card frames a vehicle photograph; off by default so static
   * cards do not accumulate stray glow.
   */
  lightBleed?: boolean;
  /**
   * Optional surface override. Use sparingly — prefer the variant to
   * keep cards aligned with the surface ladder. `bg-transparent` is
   * handy for cards that only exist to provide hover/radius geometry
   * over a parent gradient (e.g. nested inside a `showroom` card).
   */
  surface?: "low" | "default" | "high" | "highest" | "transparent";
  children?: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface-container-low",
  interactive: cn(
    "bg-surface-container-low cursor-pointer",
    "hover:bg-surface-container-high hover:shadow-glow",
  ),
  floating: "bg-surface-container-high shadow-ambient",
  showroom: cn(
    "bg-surface-container-low",
    "hover:bg-surface-container-high hover:shadow-glow",
  ),
};

const surfaceOverride: Record<NonNullable<CardProps["surface"]>, string> = {
  low:         "bg-surface-container-low",
  default:     "bg-surface-container",
  high:        "bg-surface-container-high",
  highest:     "bg-surface-container-highest",
  transparent: "bg-transparent",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm:   "p-4",
  md:   "p-6", // 24px — doc §5 canonical gap
  lg:   "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      lightBleed = false,
      surface,
      children,
      ...props
    },
    ref,
  ) => {
    const surfaceCls = surface ? surfaceOverride[surface] : variantClasses[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg overflow-hidden",
          // Premium-feel transition per doc §6 Do: "minimum 300ms ease-in-out"
          "transition-all duration-300 ease-in-out",
          surfaceCls,
          paddingClasses[padding],
          className,
        )}
        {...props}
      >
        {lightBleed && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 light-bleed"
          />
        )}
        {/* Content wrapper sits above the light-bleed layer */}
        <div className={cn("relative", lightBleed && "z-[1]")}>{children}</div>
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
export type { CardProps, CardVariant, CardPadding };
