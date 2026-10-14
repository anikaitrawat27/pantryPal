"use client";

import { ApiClientError, apiFetch } from "./api";
import { favoritesStore } from "./favorites";
import { pantryStore } from "./my-pantry";
import { planStore } from "./plan-store";
import { EMPTY_PLAN, type Plan } from "@/lib/plan";

/**
 * Keeps the browser's saved data and the signed-in account in step.
 *
 * Pages always read from the browser stores (favorites, pantry, plan). While syncing:
 * - startSync() writes the account's data into those stores,
 * - every later change to a store is pushed to the account after a short pause,
 *   and only if the data actually changed.
 */

/** What /api/me/data returns and /api/me/merge accepts. */
export interface AccountData {
  pantry: { have: string[]; low: string[] };
  plan: Plan["entries"];
  favorites: string[];
  checked: string[];
}

type Collection = "pantry" | "plan" | "favorites" | "checks";

const PUSH_DELAY_MS = 400;
const lastPushed = new Map<Collection, string>();
const timers = new Map<Collection, ReturnType<typeof setTimeout>>();
let unsubscribers: (() => void)[] = [];
let onSessionEnded: () => void = () => {};
/** True while writing account data into the stores, so it is not pushed straight back. */
let applying = false;

/** Everything saved in this browser, in the shape the account API uses. */
export function localData(): AccountData {
  const plan = planStore.get();
  const pantry = pantryStore.get();
  return {
    pantry: { have: [...pantry.have], low: [...pantry.low] },
    plan: [...plan.entries],
    favorites: [...favoritesStore.get()],
    checked: [...plan.checked],
  };
}

/** The request body for one collection's PUT /api/me/{collection}. */
function payload(c: Collection): unknown {
  const data = localData();
  if (c === "pantry") return data.pantry;
  if (c === "plan") return { entries: data.plan };
  if (c === "favorites") return { slugs: data.favorites };
  return { ingredientIds: data.checked };
}

async function push(c: Collection) {
  const body = payload(c);
  const key = JSON.stringify(body);
  if (lastPushed.get(c) === key) return;
  try {
    await apiFetch(`/api/me/${c}`, { method: "PUT", body });
    lastPushed.set(c, key);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 401) {
      // The session ended elsewhere (a password reset, or signing out on another device).
      stopSync();
      onSessionEnded();
    } else {
      console.error(`Saving ${c} failed`, err);
    }
  }
}

function schedule(...collections: Collection[]) {
  if (applying) return;
  for (const c of collections) {
    clearTimeout(timers.get(c));
    timers.set(
      c,
      setTimeout(() => void push(c), PUSH_DELAY_MS),
    );
  }
}

/** Loads the account's data into the browser stores and starts pushing changes. */
export function startSync(data: AccountData, sessionEnded: () => void) {
  stopSync();
  onSessionEnded = sessionEnded;
  applying = true;
  try {
    pantryStore.set({ have: data.pantry.have, low: data.pantry.low });
    planStore.set({ entries: data.plan, checked: data.checked });
    favoritesStore.set(data.favorites);
  } finally {
    applying = false;
  }
  for (const c of ["pantry", "plan", "favorites", "checks"] as const) lastPushed.set(c, JSON.stringify(payload(c)));
  unsubscribers = [
    pantryStore.subscribe(() => schedule("pantry")),
    planStore.subscribe(() => schedule("plan", "checks")),
    favoritesStore.subscribe(() => schedule("favorites")),
  ];
}

export function stopSync() {
  unsubscribers.forEach((unsubscribe) => unsubscribe());
  unsubscribers = [];
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  lastPushed.clear();
}

/** Stops syncing and empties this browser's copy, for signing out on a shared device. */
export function clearLocalData() {
  stopSync();
  pantryStore.set({ have: [], low: [] });
  planStore.set(EMPTY_PLAN);
  favoritesStore.set([]);
}
