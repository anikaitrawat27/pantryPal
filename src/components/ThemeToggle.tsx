"use client";

import { useEffect, useState } from "react";
import { useDict } from "@/i18n/client";

type Theme = "light" | "dark";
const KEY = "pantrypal:theme";

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Switches between light (paper) and dark (chalkboard) themes and remembers the choice. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const t = useDict().nav;

  useEffect(() => setTheme(currentTheme()), []);

  const toggle = () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage unavailable; the theme still applies for this visit.
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? t.themeLight : t.themeDark}
      style={{ background: "none", border: 0, padding: 4, cursor: "pointer", minWidth: 36, minHeight: 36 }}
    >
      <svg viewBox="0 0 32 32" width={26} height={26} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        {theme === "dark" ? (
          <>
            <circle cx="16" cy="16" r="6" />
            <path d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M7 25l3-3M22 10l3-3" />
          </>
        ) : (
          <path d="M22 20c-7 1-12-5-10-12-6 2-8 9-5 14s10 6 15-2z" />
        )}
      </svg>
    </button>
  );
}
