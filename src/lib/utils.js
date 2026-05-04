import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Safe iframe check — won't throw if window is unavailable
export const isIframe = typeof window !== 'undefined' && window.self !== window.top;
