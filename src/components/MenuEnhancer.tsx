"use client";

import { useEffect } from "react";

/**
 * The mobile menu is a native <details> element so it works without
 * JavaScript. This only adds the niceties: close on link click, on Escape
 * (returning focus to the toggle) and when tapping outside.
 */
export function MenuEnhancer() {
  useEffect(() => {
    const menu = document.querySelector<HTMLDetailsElement>(".mobile-menu");
    if (!menu) return;
    const summary = menu.querySelector("summary");

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!menu.open) return;
      if (target.closest(".mobile-menu-panel a") || !menu.contains(target)) menu.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu.open) {
        menu.open = false;
        summary?.focus();
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
