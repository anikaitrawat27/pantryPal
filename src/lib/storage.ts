"use client";

import { useSyncExternalStore } from "react";

/**
 * A value persisted in localStorage and shared by every component that reads it.
 * Storage can be blocked, full, or hold corrupt data, so reads fall back to
 * `empty` and failed writes still update the in-memory value for this visit.
 */
export interface LocalStore<T> {
  use(): T;
  get(): T;
  set(next: T): void;
  update(fn: (cur: T) => T): void;
}

export function createLocalStore<T>(key: string, parse: (raw: unknown) => T, empty: T): LocalStore<T> {
  const listeners = new Set<() => void>();
  let cache: T | undefined;

  const get = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw === null ? empty : parse(JSON.parse(raw));
    } catch {
      cache = empty;
    }
    return cache;
  };

  const set = (next: T) => {
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage unavailable; keep the in-memory value.
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = undefined;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    use: () => useSyncExternalStore(subscribe, get, () => empty),
    get,
    set,
    update: (fn) => set(fn(get())),
  };
}

/** Parses an array of strings, dropping anything else. */
export function parseStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : [];
}
