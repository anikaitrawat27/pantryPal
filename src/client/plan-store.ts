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
} from "@/lib/plan";
import { createLocalStore } from "./storage";

export const planStore = createLocalStore<Plan>("pantrypal:plan", parsePlan, EMPTY_PLAN);

export function usePlan() {
  const plan = planStore.use();
  return {
    plan,
    add: (slug: string, day: number, meal: Meal, servings: number) =>
      planStore.update((p) => addEntry(p, { slug, day, meal, servings }, newEntryId())),
    move: (id: string, day: number, meal: Meal) => planStore.update((p) => moveEntry(p, id, day, meal)),
    setServings: (id: string, servings: number) => planStore.update((p) => setEntryServings(p, id, servings)),
    remove: (id: string) => planStore.update((p) => removeEntry(p, id)),
    toggleChecked: (ingredientId: string) => planStore.update((p) => toggleChecked(p, ingredientId)),
    clearChecked: () => planStore.update((p) => ({ ...p, checked: [] })),
    clear: () => planStore.set(EMPTY_PLAN),
  };
}
