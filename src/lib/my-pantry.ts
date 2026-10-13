"use client";

import { INGREDIENTS_BY_ID } from "@/data/pantry";
import { createLocalStore, parseStringArray } from "./storage";

/** Ingredients the cook has at home. `low` is a subset of `have` marked as running low. */
export interface MyPantry {
  have: readonly string[];
  low: readonly string[];
}

const EMPTY: MyPantry = { have: [], low: [] };

const isStockable = (id: string) => {
  const ing = INGREDIENTS_BY_ID.get(id);
  return Boolean(ing && ing.tier !== "free");
};

export function parseMyPantry(raw: unknown): MyPantry {
  if (!raw || typeof raw !== "object") return EMPTY;
  const r = raw as Record<string, unknown>;
  const have = [...new Set(parseStringArray(r.have).filter(isStockable))];
  const low = parseStringArray(r.low).filter((id) => have.includes(id));
  return { have, low };
}

const store = createLocalStore<MyPantry>("pantrypal:my-pantry", parseMyPantry, EMPTY);

export function toggleHave(p: MyPantry, id: string): MyPantry {
  return p.have.includes(id)
    ? { have: p.have.filter((x) => x !== id), low: p.low.filter((x) => x !== id) }
    : { ...p, have: [...p.have, id] };
}

export function setLow(p: MyPantry, ids: readonly string[], low: boolean): MyPantry {
  const owned = ids.filter((id) => p.have.includes(id));
  return {
    ...p,
    low: low ? [...new Set([...p.low, ...owned])] : p.low.filter((x) => !owned.includes(x)),
  };
}

export function useMyPantry() {
  const pantry = store.use();
  return {
    pantry,
    toggle: (id: string) => store.update((p) => toggleHave(p, id)),
    addMany: (ids: readonly string[]) =>
      store.update((p) => ({ ...p, have: [...new Set([...p.have, ...ids.filter(isStockable)])] })),
    markLow: (ids: readonly string[], low: boolean) => store.update((p) => setLow(p, ids, low)),
    clear: () => store.set(EMPTY),
  };
}
