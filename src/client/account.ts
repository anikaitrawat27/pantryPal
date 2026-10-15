"use client";

import { useSyncExternalStore } from "react";
import { apiFetch } from "./api";
import { clearLocalData, localData, snapshotLocalData, startSync, type AccountData } from "./sync";

/** Who is signed in. Starts as "loading" until loadAccount() has asked the server. */
export type AccountState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; username: string; recoveryCodesLeft: number };

/** One shared object: React requires the server snapshot to return the same value every time. */
const LOADING: AccountState = { status: "loading" };

let state: AccountState = LOADING;
const listeners = new Set<() => void>();

function setState(next: AccountState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function useAccount(): AccountState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => LOADING,
  );
}

type Me = { user: { username: string; recoveryCodesLeft: number } | null };

const becomeGuest = () => setState({ status: "guest" });

/** After signing in on this device, fold anything saved here as a guest into the account. */
async function afterSignIn() {
  const merged = await apiFetch<AccountData>("/api/me/merge", { method: "POST", body: localData() });
  const me = await apiFetch<Me>("/api/me");
  startSync(merged, becomeGuest);
  if (me.user) setState({ status: "user", ...me.user });
}

let loadStarted = false;

/** Runs once per page load: finds out who is signed in and, if anyone, pulls their data. */
export async function loadAccount() {
  if (loadStarted) return;
  loadStarted = true;
  // Changes made while the requests below are in flight must survive the account's copy.
  const localBefore = snapshotLocalData();
  try {
    const me = await apiFetch<Me>("/api/me");
    if (!me.user) return becomeGuest();
    startSync(await apiFetch<AccountData>("/api/me/data"), becomeGuest, localBefore);
    setState({ status: "user", ...me.user });
  } catch (err) {
    // Accounts are optional: if the server or database is unavailable, keep working as a guest.
    console.error("Could not load account", err);
    becomeGuest();
  }
}

/** Creates an account and signs in. Returns the recovery codes, which are shown only once. */
export async function signUp(username: string, password: string): Promise<string[]> {
  const res = await apiFetch<{ recoveryCodes: string[] }>("/api/auth/signup", {
    method: "POST",
    body: { username, password },
  });
  await afterSignIn();
  return res.recoveryCodes;
}

export async function logIn(username: string, password: string) {
  await apiFetch("/api/auth/login", { method: "POST", body: { username, password } });
  await afterSignIn();
}

/** Sets a new password with a recovery code and signs in. Returns how many codes are left. */
export async function resetPassword(username: string, code: string, newPassword: string): Promise<number> {
  const res = await apiFetch<{ codesLeft: number }>("/api/auth/reset", {
    method: "POST",
    body: { username, code, newPassword },
  });
  await afterSignIn();
  return res.codesLeft;
}

/** Signs out and clears this device's copy of the account's data. */
export async function logOut() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  clearLocalData();
  becomeGuest();
}

export async function regenerateRecoveryCodes(password: string): Promise<string[]> {
  const res = await apiFetch<{ recoveryCodes: string[] }>("/api/me/recovery-codes", {
    method: "POST",
    body: { password },
  });
  if (state.status === "user") setState({ ...state, recoveryCodesLeft: res.recoveryCodes.length });
  return res.recoveryCodes;
}

export async function deleteAccount(password: string) {
  await apiFetch("/api/me", { method: "DELETE", body: { password } });
  clearLocalData();
  becomeGuest();
}
