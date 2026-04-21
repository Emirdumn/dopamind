"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/**
 * Airbnb-inspired button primitive.
 *
 * Variants:
 * - `primary`      — Rausch coral background, white label. The system's
 *                    single highest-visibility CTA (Reserve / Search / Compare).
 * - `secondary`    — White pill-outlined button with Ink label. The most
 *                    common neutral action ("Become a host" / "View details").
 * - `ghost`        — Transparent fill, Ink label, Soft Cloud hover. Used for
 *                    tertiary in-row actions.
 * - `danger`       — Error Red fill. Destructive actions only.
 * - `icon-circle`  — 40×40 circular icon button. The system's signature
 *                    geometry — back arrow, share, favorite, carousel arrows.
 *
 * Sizes (not applicable to `icon-circle`):
 * - `sm`  — 32px tall, 14px label (inline actions, toolbars)
 * - `md`  — 40px tall, 14px label (default)
 * - `lg`  — 48px tall, 16px label (primary hero CTA)
 *
 * Shape:
 * - `rect` (default) — 8px radius
 * - `pill`           — 20px radius (full rounded ends on md/lg heights)
 */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon-circle";
type ButtonSize    = "sm" | "md" | "lg";
type ButtonShape   = "rect" | "pill";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?:    ButtonSize;
  shape?:   ButtonShape;
  loading?: boolean;
  /** Optional left icon (sm component). Not used on icon-circle. */
  leadingIcon?: ReactNode;
  /** Optional right icon (sm component). Not used on icon-circle. */
  trailingIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-rausch text-canvas hover:bg-rausch-deep focus-visible:shadow-focus active:scale-[0.96]",
  secondary:
    "bg-canvas text-ink border border-hairline hover:border-ink hover:bg-subsurface focus-visible:shadow-focus active:scale-[0.96]",
  ghost:
    "bg-transparent text-ink hover:bg-subsurface focus-visible:shadow-focus active:scale-[0.96]",
  danger:
    "bg-error text-canvas hover:bg-error-deep focus-visible:shadow-focus active:scale-[0.96]",
  "icon-circle":
    "bg-canvas text-ink border border-hairline hover:bg-subsurface focus-visible:shadow-focus active:scale-[0.92]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-4 text-[14px] gap-1.5",
  md: "h-10 px-5 text-[14px] gap-2",
  lg: "h-12 px-6 text-[16px] gap-2",
};

const shapeClasses: Record<ButtonShape, string> = {
  rect: "rounded-md",
  pill: "rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      shape = "rect",
      loading,
      leadingIcon,
      trailingIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isIconCircle = variant === "icon-circle";

    const base = cn(
      "relative inline-flex items-center justify-center font-sans font-medium",
      "transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out",
      "outline-none select-none whitespace-nowrap",
      "disabled:cursor-not-allowed disabled:opacity-50",
    );

    const shapeCls = isIconCircle
      ? "h-10 w-10 rounded-full p-0"
      : cn(sizeClasses[size], shapeClasses[shape]);

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(base, variantClasses[variant], shapeCls, className)}
        {...props}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            {!isIconCircle && leadingIcon}
            {children}
            {!isIconCircle && trailingIcon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default Button;
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonShape };
