import { MEALS, type Meal } from "@/data/schema";

export interface PlanEntry {
  id: string;
  /** 0 is Monday. */
  day: number;
  meal: Meal;
  slug: string;
  servings: number;
}

export interface Plan {
  entries: readonly PlanEntry[];
  /** Shopping-list ingredient ids the cook has ticked off. */
  checked: readonly string[];
}

export const EMPTY_PLAN: Plan = { entries: [], checked: [] };

const clampServings = (n: number) => Math.min(6, Math.max(1, Math.round(n)));

function parseEntry(raw: unknown): PlanEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.id !== "string" || typeof e.slug !== "string") return null;
  if (!Number.isInteger(e.day) || (e.day as number) < 0 || (e.day as number) > 6) return null;
  if (!(MEALS as readonly unknown[]).includes(e.meal)) return null;
  if (typeof e.servings !== "number" || !Number.isFinite(e.servings)) return null;
  return { id: e.id, day: e.day as number, meal: e.meal as Meal, slug: e.slug, servings: clampServings(e.servings) };
}

export function parsePlan(raw: unknown): Plan {
  if (!raw || typeof raw !== "object") return EMPTY_PLAN;
  const r = raw as Record<string, unknown>;
  const entries = Array.isArray(r.entries) ? r.entries.map(parseEntry).filter((e): e is PlanEntry => e !== null) : [];
  const checked = Array.isArray(r.checked) ? r.checked.filter((c): c is string => typeof c === "string") : [];
  return { entries, checked };
}

export function addEntry(plan: Plan, entry: Omit<PlanEntry, "id">, id: string): Plan {
  return { ...plan, entries: [...plan.entries, { ...entry, id, servings: clampServings(entry.servings) }] };
}

export function moveEntry(plan: Plan, id: string, day: number, meal: Meal): Plan {
  return { ...plan, entries: plan.entries.map((e) => (e.id === id ? { ...e, day, meal } : e)) };
}

export function setEntryServings(plan: Plan, id: string, servings: number): Plan {
  return { ...plan, entries: plan.entries.map((e) => (e.id === id ? { ...e, servings: clampServings(servings) } : e)) };
}

export function removeEntry(plan: Plan, id: string): Plan {
  return { ...plan, entries: plan.entries.filter((e) => e.id !== id) };
}

export function toggleChecked(plan: Plan, ingredientId: string): Plan {
  return {
    ...plan,
    checked: plan.checked.includes(ingredientId)
      ? plan.checked.filter((c) => c !== ingredientId)
      : [...plan.checked, ingredientId],
  };
}

export function entriesFor(plan: Plan, day: number, meal: Meal): PlanEntry[] {
  return plan.entries.filter((e) => e.day === day && e.meal === meal);
}

export function newEntryId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
