import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names conditionally and merges conflicting Tailwind CSS utility classes.
 * Standard helper function for all shadcn/ui components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

