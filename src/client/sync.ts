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
 * - startSync() writes the account's data into those stores, except collections changed
 *   locally since a given snapshot, which keep the local value and are pushed instead,
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

const COLLECTIONS: readonly Collection[] = ["pantry", "plan", "favorites", "checks"];

/** What each collection held in this browser at one moment; see snapshotLocalData(). */
export type LocalSnapshot = Readonly<Record<Collection, string>>;

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
function payload(c: Collection, data: AccountData = localData()): unknown {
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

/** Records what this browser holds now, so startSync() can tell which collections changed since. */
export function snapshotLocalData(): LocalSnapshot {
  const data = localData();
  return Object.fromEntries(COLLECTIONS.map((c) => [c, JSON.stringify(payload(c, data))])) as LocalSnapshot;
}

/**
 * Loads the account's data into the browser stores and starts pushing changes.
 *
 * With `localBefore`, a collection that changed in this browser since that snapshot (say, a tap
 * made while the account data was loading) keeps its local value, which is then pushed. Without
 * it, the account's data replaces everything.
 */
export function startSync(data: AccountData, sessionEnded: () => void, localBefore?: LocalSnapshot) {
  stopSync();
  onSessionEnded = sessionEnded;
  const local = localData();
  const keepLocal = (c: Collection) => localBefore !== undefined && localBefore[c] !== JSON.stringify(payload(c, local));
  applying = true;
  try {
    if (!keepLocal("pantry")) pantryStore.set({ have: data.pantry.have, low: data.pantry.low });
    planStore.set({
      entries: keepLocal("plan") ? local.plan : data.plan,
      checked: keepLocal("checks") ? local.checked : data.checked,
    });
    if (!keepLocal("favorites")) favoritesStore.set(data.favorites);
  } finally {
    applying = false;
  }
  // The account holds `data`, so anything here that differs from it still needs pushing.
  for (const c of COLLECTIONS) lastPushed.set(c, JSON.stringify(payload(c, data)));
  unsubscribers = [
    pantryStore.subscribe(() => schedule("pantry")),
    planStore.subscribe(() => schedule("plan", "checks")),
    favoritesStore.subscribe(() => schedule("favorites")),
  ];
  schedule(...COLLECTIONS.filter(keepLocal));
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
