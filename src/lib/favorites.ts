"use client";

import { createLocalStore, parseStringArray } from "./storage";

const store = createLocalStore<readonly string[]>("pantrypal:favorites", parseStringArray, []);

export function useFavorites() {
  const favorites = store.use();
  return {
    favorites,
    toggle: (slug: string) =>
      store.update((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug])),
    isFavorite: (slug: string) => favorites.includes(slug),
  };
}
