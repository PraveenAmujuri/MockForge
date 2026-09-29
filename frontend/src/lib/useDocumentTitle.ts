"use client";

import { useEffect, useRef } from "react";

export const DEFAULT_TITLE = "MockForge - Instant Mock REST APIs for Frontend Teams";
const SUFFIX = "MockForge";

/**
 * Bulletproof custom hook to dynamically update document title with SSR safety,
 * try/catch fallbacks, and unmount cleanup.
 *
 * @param title Specific page or task title (e.g. "Endpoints · MyProject")
 * @param includeSuffix Whether to append "| MockForge" if not already present
 * @param fallbackTitle Custom fallback if title is not provided
 */
export function useDocumentTitle(
  title?: string | null,
  includeSuffix = true,
  fallbackTitle: string = DEFAULT_TITLE
) {
  const prevTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    try {
      if (prevTitleRef.current === null) {
        prevTitleRef.current = document.title || DEFAULT_TITLE;
      }

      if (!title || typeof title !== "string" || !title.trim()) {
        document.title = fallbackTitle || DEFAULT_TITLE;
        return;
      }

      const trimmed = title.trim();
      if (!includeSuffix || trimmed.includes(SUFFIX)) {
        document.title = trimmed;
      } else {
        document.title = `${trimmed} | ${SUFFIX}`;
      }
    } catch {
      // In case of restricted iframe, cross-origin sandbox or browser restrictions
      try {
        if (typeof document !== "undefined") {
          document.title = DEFAULT_TITLE;
        }
      } catch {
        // Silently swallow to prevent UI crash
      }
    }
  }, [title, includeSuffix, fallbackTitle]);
}
