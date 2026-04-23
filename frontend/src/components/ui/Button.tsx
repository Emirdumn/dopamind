"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/**
 * Midnight Showroom button primitive.
 *
 * Variants (per design doc §5):
 * - `primary`      — Indigo LED gradient (#c0c1ff → #8083ff), white label,
 *                    no border, 12px radius. Hover lifts with primary glow
 *                    ring; press dampens with a tonal shift.
 * - `secondary`    — Transparent fill with `outline-variant` ghost border
 *                    @ 30%. Hover fills with 10% primary tint and the
 *                    border warms to primary @ 28%.
 * - `tertiary`     — Text-only primary label, no fill, no border. Highest
 *                    energy at the smallest footprint; used for inline
 *                    "View details" / "Learn more" moments.
 * - `ghost`        — Transparent fill, on-surface label, surface-container
 *                    hover. For low-emphasis chrome (cancel, close inline).
 * - `danger`       — MD3 error container fill with on-error-container label.
 *                    Destructive actions only.
 * - `icon-circle`  — 40×40 circular icon button with a ghost border and
 *                    surface-container hover. The system's signature icon
 *                    geometry for share/favorite/carousel/close.
 *
 * Sizes (not applicable to `icon-circle`):
 * - `sm`  — 32px tall, 14px label (inline actions, toolbars)
 * - `md`  — 40px tall, 14px label (default)
 * - `lg`  — 48px tall, 16px label (primary hero CTA)
 *
 * Shape:
 * - `rect` (default) — 12px radius (MD3 xl) — used on all standard buttons.
 * - `pill`           — 20px radius — larger surfaces, hero cards, input-pairs.
 */
type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "danger" | "icon-circle";
type ButtonSize    = "sm" | "md" | "lg";
type ButtonShape   = "rect" | "pill";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?:    ButtonSize;
  shape?:   ButtonShape;
  loading?: boolean;
  /** Optional left icon. Not used on icon-circle. */
  leadingIcon?: ReactNode;
  /** Optional right icon. Not used on icon-circle. */
  trailingIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    "primary-gradient text-white shadow-pop",
    "hover:shadow-glow hover:brightness-110",
    "active:scale-[0.97] active:brightness-95",
    "focus-visible:shadow-focus",
  ),
  secondary: cn(
    "bg-transparent text-on-surface ghost-border",
    "hover:text-primary",
    "active:scale-[0.97]",
    "focus-visible:shadow-focus",
  ),
  tertiary: cn(
    "bg-transparent text-primary",
    "hover:text-primary-container",
    "active:scale-[0.97]",
    "focus-visible:shadow-focus",
  ),
  ghost: cn(
    "bg-transparent text-on-surface",
    "hover:bg-surface-container",
    "active:scale-[0.97]",
    "focus-visible:shadow-focus",
  ),
  danger: cn(
    "bg-error-container text-error-on-container",
    "hover:brightness-110",
    "active:scale-[0.97]",
    "focus-visible:shadow-focus",
  ),
  "icon-circle": cn(
    "bg-transparent text-on-surface ghost-border",
    "hover:bg-surface-container hover:text-primary",
    "active:scale-[0.92]",
    "focus-visible:shadow-focus",
  ),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-4 text-[14px] gap-1.5",
  md: "h-10 px-5 text-[14px] gap-2",
  lg: "h-12 px-6 text-[16px] gap-2",
};

const shapeClasses: Record<ButtonShape, string> = {
  rect: "rounded-lg", // MD3 xl = 12px per tailwind config
  pill: "rounded-xl", // 20px — hero cards
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
      "relative inline-flex items-center justify-center font-sans font-semibold",
      "transition duration-300 ease-in-out",
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
