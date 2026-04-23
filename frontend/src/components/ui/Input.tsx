"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

/**
 * Midnight Showroom text input (design doc §5).
 *
 * - No solid background — renders on the parent's surface tone.
 * - **Bottom-only "Ghost Border"** using `outline-variant` @ 22% opacity.
 *   Focus thickens the border to 2px primary indigo with a 300ms animation.
 * - On error the ghost border switches to MD3 error and the helper text
 *   reads in `error` (on-error-container foreground).
 * - Label sits above at 12px on-surface-variant; optional helper at 12px.
 *
 * A leading or trailing icon slot supports search-style fields without
 * altering the chrome — icons sit on the same transparent row.
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leadingIcon,
      trailingIcon,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id ?? `input-${autoId}`;
    const hasError = Boolean(error);
    const helper = error ?? helperText;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block font-sans text-[12px] font-medium text-on-surface-variant"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "group relative flex items-center w-full",
            "bg-transparent transition-[border-color] duration-300 ease-in-out",
            // Bottom-only ghost border — outline-variant @ 22%, thickens on focus.
            "border-b",
            hasError
              ? "border-error focus-within:border-error"
              : "border-[rgba(67,71,88,0.22)] focus-within:border-primary focus-within:border-b-2",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {leadingIcon && (
            <span className="pl-1 pr-2 text-on-surface-variant flex items-center" aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={helper ? `${inputId}-help` : undefined}
            className={cn(
              "w-full bg-transparent outline-none",
              "font-sans text-[15px] font-medium text-on-surface placeholder:text-mute",
              "px-1 py-[10px]",
              "disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />

          {trailingIcon && (
            <span className="pl-2 pr-1 text-on-surface-variant flex items-center" aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </div>

        {helper && (
          <p
            id={`${inputId}-help`}
            className={cn(
              "mt-2 font-sans text-[12px]",
              hasError ? "text-error font-medium" : "text-on-surface-variant",
            )}
          >
            {helper}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
export type { InputProps };
