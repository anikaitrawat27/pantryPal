"use client";

import { createLocalStore, parseStringArray } from "./storage";

export const favoritesStore = createLocalStore<readonly string[]>("pantrypal:favorites", parseStringArray, []);

export function useFavorites() {
  const favorites = favoritesStore.use();
  return {
    favorites,
    toggle: (slug: string) =>
      favoritesStore.update((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug])),
    isFavorite: (slug: string) => favorites.includes(slug),
  };
}
