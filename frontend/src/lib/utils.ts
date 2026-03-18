import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency: string = "TRY"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (currency === "TRY") {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(num);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
