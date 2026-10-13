"use client";

import type { Meal } from "@/data/schema";
import {
  addEntry,
  EMPTY_PLAN,
  moveEntry,
  newEntryId,
  parsePlan,
  removeEntry,
  setEntryServings,
  toggleChecked,
  type Plan,
} from "./plan";
import { createLocalStore } from "./storage";

const store = createLocalStore<Plan>("pantrypal:plan", parsePlan, EMPTY_PLAN);

export function usePlan() {
  const plan = store.use();
  return {
    plan,
    add: (slug: string, day: number, meal: Meal, servings: number) =>
      store.update((p) => addEntry(p, { slug, day, meal, servings }, newEntryId())),
    move: (id: string, day: number, meal: Meal) => store.update((p) => moveEntry(p, id, day, meal)),
    setServings: (id: string, servings: number) => store.update((p) => setEntryServings(p, id, servings)),
    remove: (id: string) => store.update((p) => removeEntry(p, id)),
    toggleChecked: (ingredientId: string) => store.update((p) => toggleChecked(p, ingredientId)),
    clearChecked: () => store.update((p) => ({ ...p, checked: [] })),
    clear: () => store.set(EMPTY_PLAN),
  };
}
