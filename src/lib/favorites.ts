"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "pantrypal:favorites";
const EMPTY: readonly string[] = [];
const listeners = new Set<() => void>();

let cache: readonly string[] | null = null;

/** Reads favorites from localStorage. Storage can be blocked or corrupt, so failures read as empty. */
function read(): readonly string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: readonly string[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage is unavailable (private mode, quota). Favorites still work for this page view.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((slug: string) => {
    const cur = read();
    write(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
  }, []);
  return { favorites, toggle, isFavorite: (slug: string) => favorites.includes(slug) };
}
