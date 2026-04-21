"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

/**
 * Airbnb-inspired text input.
 *
 * - White canvas, 1px Hairline border, 8px radius, 14px padding
 * - On focus: border → Ink Black + 2px Ink outer ring (`shadow-focus`)
 * - On error: border + helper text switch to Error Red `#c13515`
 * - Label sits above at 12px Ash; optional helper at 12px Ash (or Error Red)
 *
 * A leading or trailing icon slot can be supplied for search-style fields.
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
            className="mb-1.5 block font-sans text-[12px] font-medium text-ash"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "group relative flex items-center w-full",
            "rounded-md border bg-canvas transition-[border-color,box-shadow] duration-150 ease-out",
            hasError
              ? "border-error focus-within:border-error focus-within:shadow-[0_0_0_2px_#c13515]"
              : "border-hairline focus-within:border-ink focus-within:shadow-focus",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {leadingIcon && (
            <span className="pl-4 text-ash flex items-center" aria-hidden="true">
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
              "font-sans text-[14px] font-medium text-ink placeholder:text-mute",
              "px-4 py-[12px]",
              leadingIcon && "pl-2",
              trailingIcon && "pr-2",
              "disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />

          {trailingIcon && (
            <span className="pr-4 text-ash flex items-center" aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </div>

        {helper && (
          <p
            id={`${inputId}-help`}
            className={cn(
              "mt-1 font-sans text-[12px]",
              hasError ? "text-error font-medium" : "text-ash",
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
