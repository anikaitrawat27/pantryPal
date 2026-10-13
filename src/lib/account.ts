"use client";

import { useSyncExternalStore } from "react";
import { ApiClientError } from "./api/client";
import { favoritesStore } from "./favorites";
import { pantryStore, type MyPantry } from "./my-pantry";
import { EMPTY_PLAN, type Plan } from "./plan";
import { planStore } from "./plan-store";

export type AccountState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; username: string; recoveryCodesLeft: number };

let state: AccountState = { status: "loading" };
const listeners = new Set<() => void>();

function setState(next: AccountState) {
  state = next;
  listeners.forEach((l) => l());
}

export function useAccount(): AccountState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => ({ status: "loading" }) as AccountState,
  );
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init.body ? { "content-type": "application/json" } : undefined,
    credentials: "same-origin",
  });
  if (!res.ok) throw new ApiClientError(res.status, await res.json().catch(() => null));
  return (res.status === 204 ? null : await res.json()) as T;
}

// Sync. Browser storage stays the source the pages read from; when signed in, every
// change is pushed to the account and the account's data is pulled on page load.

interface ServerData {
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
/** Set while writing server data into the stores, so it is not echoed straight back. */
let applying = false;

function localSnapshot(): ServerData {
  const p = planStore.get();
  return {
    pantry: { have: [...pantryStore.get().have], low: [...pantryStore.get().low] },
    plan: [...p.entries],
    favorites: [...favoritesStore.get()],
    checked: [...p.checked],
  };
}

function payload(c: Collection): unknown {
  const snap = localSnapshot();
  if (c === "pantry") return snap.pantry;
  if (c === "plan") return { entries: snap.plan };
  if (c === "favorites") return { slugs: snap.favorites };
  return { ingredientIds: snap.checked };
}

function applyServerData(data: ServerData) {
  applying = true;
  try {
    pantryStore.set({ have: data.pantry.have, low: data.pantry.low } satisfies MyPantry);
    planStore.set({ entries: data.plan, checked: data.checked });
    favoritesStore.set(data.favorites);
  } finally {
    applying = false;
  }
  for (const c of ["pantry", "plan", "favorites", "checks"] as const) lastPushed.set(c, JSON.stringify(payload(c)));
}

async function push(c: Collection) {
  const body = JSON.stringify(payload(c));
  if (lastPushed.get(c) === body) return;
  try {
    await api(`/api/me/${c}`, { method: "PUT", body });
    lastPushed.set(c, body);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 401) {
      // The session ended elsewhere (password reset, sign-out on another device).
      stopSync();
      setState({ status: "guest" });
      return;
    }
    console.error(`Saving ${c} failed`, err);
  }
}

function schedule(...collections: Collection[]) {
  if (applying || state.status !== "user") return;
  for (const c of collections) {
    clearTimeout(timers.get(c));
    timers.set(
      c,
      setTimeout(() => void push(c), PUSH_DELAY_MS),
    );
  }
}

function startSync(data: ServerData) {
  stopSync();
  applyServerData(data);
  unsubscribers = [
    pantryStore.subscribe(() => schedule("pantry")),
    planStore.subscribe(() => schedule("plan", "checks")),
    favoritesStore.subscribe(() => schedule("favorites")),
  ];
}

function stopSync() {
  unsubscribers.forEach((u) => u());
  unsubscribers = [];
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  lastPushed.clear();
}

function clearLocal() {
  stopSync();
  pantryStore.set({ have: [], low: [] });
  planStore.set(EMPTY_PLAN);
  favoritesStore.set([]);
}

async function signedIn(username: string) {
  // First sign-in on this device: fold anything saved here as a guest into the account.
  const merged = await api<ServerData>("/api/me/merge", { method: "POST", body: JSON.stringify(localSnapshot()) });
  const me = await api<{ user: { username: string; recoveryCodesLeft: number } | null }>("/api/me");
  startSync(merged);
  setState({ status: "user", username, recoveryCodesLeft: me.user?.recoveryCodesLeft ?? 0 });
}

let loadStarted = false;

/** Runs once per page load: finds out who is signed in and, if anyone, pulls their data. */
export async function loadAccount() {
  if (loadStarted) return;
  loadStarted = true;
  try {
    const me = await api<{ user: { username: string; recoveryCodesLeft: number } | null }>("/api/me");
    if (!me.user) return setState({ status: "guest" });
    startSync(await api<ServerData>("/api/me/data"));
    setState({ status: "user", ...me.user });
  } catch (err) {
    // Accounts are optional: if the server or database is unavailable, keep working as a guest.
    console.error("Could not load account", err);
    setState({ status: "guest" });
  }
}

export async function signUp(username: string, password: string): Promise<string[]> {
  const res = await api<{ user: { username: string }; recoveryCodes: string[] }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  await signedIn(res.user.username);
  return res.recoveryCodes;
}

export async function logIn(username: string, password: string) {
  const res = await api<{ user: { username: string } }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  await signedIn(res.user.username);
}

export async function resetPassword(username: string, code: string, newPassword: string): Promise<number> {
  const res = await api<{ user: { username: string }; codesLeft: number }>("/api/auth/reset", {
    method: "POST",
    body: JSON.stringify({ username, code, newPassword }),
  });
  await signedIn(res.user.username);
  return res.codesLeft;
}

/** Signs out and clears this device's copy of the account's data. */
export async function logOut() {
  await api("/api/auth/logout", { method: "POST" });
  clearLocal();
  setState({ status: "guest" });
}

export async function regenerateRecoveryCodes(password: string): Promise<string[]> {
  const res = await api<{ recoveryCodes: string[] }>("/api/me/recovery-codes", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  if (state.status === "user") setState({ ...state, recoveryCodesLeft: res.recoveryCodes.length });
  return res.recoveryCodes;
}

export async function deleteAccount(password: string) {
  await api("/api/me", { method: "DELETE", body: JSON.stringify({ password }) });
  clearLocal();
  setState({ status: "guest" });
}

/** The first field error or message from an API error, for showing under a form. */
export function errorMessage(err: unknown, fallback: string): { message: string; fields: Record<string, string> } {
  if (err instanceof ApiClientError && err.body)
    return { message: err.body.error.message, fields: err.body.error.fields ?? {} };
  return { message: fallback, fields: {} };
}
