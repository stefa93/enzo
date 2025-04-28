import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A helper to merge Tailwind class strings together,
 * filtering out falsy values and deduplicating.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}