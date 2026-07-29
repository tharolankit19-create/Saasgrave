import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export function money(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

// "started X ago" style helper for the autopsy timeline.
export function monthsBetween(a?: string | null, b?: string | null) {
  if (!a) return null;
  const start = new Date(a);
  const end = b ? new Date(b) : new Date();
  return Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  );
}
