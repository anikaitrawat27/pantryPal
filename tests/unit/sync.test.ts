import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiFetch = vi.hoisted(() => vi.fn());
vi.mock("@/client/api", () => ({ apiFetch, ApiClientError: class extends Error {} }));

// The stores read and write localStorage; give them a minimal browser window.
const storage = new Map<string, string>();
vi.stubGlobal("window", {
  localStorage: {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => void storage.set(k, v),
  },
  addEventListener: () => {},
  removeEventListener: () => {},
});

const { favoritesStore } = await import("@/client/favorites");
const { pantryStore } = await import("@/client/my-pantry");
const { planStore } = await import("@/client/plan-store");
const { snapshotLocalData, startSync, stopSync } = await import("@/client/sync");
type AccountData = import("@/client/sync").AccountData;

const entry = (id: string, slug: string) => ({ id, slug, day: 0, meal: "dinner" as const, servings: 2 });

const server: AccountData = {
  pantry: { have: ["milk"], low: [] },
  plan: [entry("a", "server-dish")],
  favorites: ["server-fav"],
  checked: ["salt"],
};

/** Resolves pending push timers and the PUT calls they make. */
async function flushPushes() {
  await vi.runAllTimersAsync();
}

const puts = () => apiFetch.mock.calls.map(([path, opts]) => [path, opts.body]);

beforeEach(() => {
  vi.useFakeTimers();
  apiFetch.mockReset().mockResolvedValue(null);
  pantryStore.set({ have: ["milk"], low: [] });
  planStore.set({ entries: [], checked: [] });
  favoritesStore.set([]);
});

afterEach(() => {
  stopSync();
  vi.useRealTimers();
});

describe("startSync", () => {
  it("replaces local data with the account's when nothing changed during loading", async () => {
    const before = snapshotLocalData();
    startSync(server, () => {}, before);
    await flushPushes();

    expect(pantryStore.get()).toEqual(server.pantry);
    expect(planStore.get()).toEqual({ entries: server.plan, checked: server.checked });
    expect(favoritesStore.get()).toEqual(server.favorites);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("keeps and pushes a collection changed while the account was loading", async () => {
    const before = snapshotLocalData();
    pantryStore.set({ have: ["milk", "rice"], low: [] });

    startSync(server, () => {}, before);
    expect(pantryStore.get()).toEqual({ have: ["milk", "rice"], low: [] });
    // Unchanged collections still take the account's copy.
    expect(planStore.get()).toEqual({ entries: server.plan, checked: server.checked });
    expect(favoritesStore.get()).toEqual(server.favorites);

    await flushPushes();
    expect(puts()).toEqual([["/api/me/pantry", { have: ["milk", "rice"], low: [] }]]);
  });

  it("keeps a removal made during loading instead of restoring the account's item", async () => {
    const before = snapshotLocalData();
    pantryStore.set({ have: [], low: [] });

    startSync(server, () => {}, before);
    await flushPushes();

    expect(pantryStore.get()).toEqual({ have: [], low: [] });
    expect(puts()).toEqual([["/api/me/pantry", { have: [], low: [] }]]);
  });

  it("treats plan entries and shopping checks as separate collections", async () => {
    const before = snapshotLocalData();
    planStore.set({ entries: [], checked: ["pepper"] });

    startSync(server, () => {}, before);
    expect(planStore.get()).toEqual({ entries: server.plan, checked: ["pepper"] });

    await flushPushes();
    expect(puts()).toEqual([["/api/me/checks", { ingredientIds: ["pepper"] }]]);
  });

  it("does not push a local change that already matches the account", async () => {
    const before = snapshotLocalData();
    favoritesStore.set(["server-fav"]);

    startSync(server, () => {}, before);
    await flushPushes();

    expect(favoritesStore.get()).toEqual(["server-fav"]);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("replaces everything when given no snapshot", async () => {
    pantryStore.set({ have: ["rice"], low: [] });
    startSync(server, () => {});
    await flushPushes();

    expect(pantryStore.get()).toEqual(server.pantry);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("pushes later changes once each", async () => {
    startSync(server, () => {}, snapshotLocalData());
    pantryStore.set({ have: ["milk", "egg"], low: [] });
    pantryStore.set({ have: ["milk", "egg"], low: [] });
    await flushPushes();
    pantryStore.set({ have: ["milk", "egg"], low: [] });
    await flushPushes();

    expect(puts()).toEqual([["/api/me/pantry", { have: ["milk", "egg"], low: [] }]]);
  });
});
