import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a page name to a URL path.
 * e.g. "Home" -> "/", "Settings" -> "/Settings"
 */
export function createPageUrl(pageName) {
  if (!pageName || pageName === "Home") return "/";
  return `/${pageName}`;
}

export const isIframe = typeof window !== "undefined" && window.self !== window.top;
