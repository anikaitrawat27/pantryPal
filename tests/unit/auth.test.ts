import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { POST as loginRoute } from "@/app/api/auth/login/route";
import { POST as logoutRoute } from "@/app/api/auth/logout/route";
import { POST as resetRoute } from "@/app/api/auth/reset/route";
import { POST as signupRoute } from "@/app/api/auth/signup/route";
import { GET as dataRoute } from "@/app/api/me/data/route";
import { POST as mergeRoute } from "@/app/api/me/merge/route";
import { PUT as pantryRoute } from "@/app/api/me/pantry/route";
import { PUT as planRoute } from "@/app/api/me/plan/route";
import { POST as codesRoute } from "@/app/api/me/recovery-codes/route";
import { DELETE as deleteMeRoute, GET as meRoute } from "@/app/api/me/route";
import { normalizeRecoveryCode, recoveryCode } from "@/server/auth/crypto";
import { hit } from "@/server/auth/rate-limit";
import { createSession, SESSION_TTL, validateSession } from "@/server/auth/session";
import { openPglite, setDbForTests, type Db } from "@/server/db";
import { authEvents, rateLimits, sessions, users } from "@/server/db/schema";

const ORIGIN = "http://localhost:3000";
let db: Db;
let ipCounter = 0;

beforeAll(async () => {
  db = await openPglite("memory://");
  setDbForTests(db);
}, 30_000);

beforeEach(async () => {
  // A fresh IP per test keeps per-IP rate limits from leaking between tests.
  ipCounter++;
  await db.delete(rateLimits);
});

type Handler = (req: Request) => Promise<Response>;

async function call(
  handler: Handler,
  method: string,
  body?: unknown,
  opts: { cookie?: string; origin?: string | null; ip?: string } = {},
) {
  const headers: Record<string, string> = {
    host: "localhost:3000",
    "x-forwarded-for": opts.ip ?? `10.0.0.${ipCounter}`,
  };
  if (opts.origin !== null) headers.origin = opts.origin ?? ORIGIN;
  if (opts.cookie) headers.cookie = opts.cookie;
  if (body !== undefined) headers["content-type"] = "application/json";
  const res = await handler(
    new Request(`${ORIGIN}/api/x`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }),
  );
  const text = await res.text();
  const setCookie = res.headers.get("set-cookie");
  return {
    status: res.status,
    body: text ? JSON.parse(text) : null,
    headers: res.headers,
    cookie: setCookie ? setCookie.split(";")[0] : undefined,
    setCookie,
  };
}

let userCount = 0;
async function newUser(password = "correct horse battery") {
  const username = `cook${++userCount}`;
  const res = await call(signupRoute, "POST", { username, password });
  expect(res.status).toBe(201);
  return { username, password, cookie: res.cookie!, codes: res.body.recoveryCodes as string[] };
}

describe("signup", () => {
  it("creates an account, signs it in, and returns 8 recovery codes once", async () => {
    const res = await call(signupRoute, "POST", { username: "Maria_G", password: "a long passphrase" });
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ username: "Maria_G" });
    expect(res.body.recoveryCodes).toHaveLength(8);
    expect(new Set(res.body.recoveryCodes).size).toBe(8);
    expect(res.setCookie).toMatch(/^pp_session=[\w-]+; Path=\/; HttpOnly; SameSite=Lax; Expires=/);

    const me = await call(meRoute, "GET", undefined, { cookie: res.cookie });
    expect(me.body.user).toEqual({ username: "Maria_G", recoveryCodesLeft: 8 });
  });

  it("never stores the password, session token, or recovery codes in plain text", async () => {
    const { username, password, cookie, codes } = await newUser();
    const [row] = await db
      .select()
      .from(users)
      .where((await import("drizzle-orm")).eq(users.username, username));
    expect(row.passwordHash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(row.passwordHash).not.toContain(password);
    const token = cookie.split("=")[1];
    const stored = await db.select().from(sessions);
    expect(stored.some((s) => s.id === token)).toBe(false);
    const dump = JSON.stringify(await db.execute("select * from recovery_codes"));
    for (const code of codes) expect(dump).not.toContain(code);
  });

  it("rejects taken usernames case-insensitively", async () => {
    const { username } = await newUser();
    const res = await call(signupRoute, "POST", { username: username.toUpperCase(), password: "another long one" });
    expect(res.status).toBe(409);
    expect(res.body.error.fields).toEqual({ username: "That username is taken." });
  });

  it("validates usernames and passwords", async () => {
    const res = await call(signupRoute, "POST", { username: "a!", password: "short" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.fields).sort()).toEqual(["password", "username"]);
    const same = await call(signupRoute, "POST", { username: "samesame123", password: "SameSame123" });
    expect(same.body.error.fields.password).toBe("Your password cannot be your username.");
  });
});

describe("login and logout", () => {
  it("signs in with the right password, case-insensitive username", async () => {
    const { username, password } = await newUser();
    const res = await call(loginRoute, "POST", { username: username.toUpperCase(), password });
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe(username);
    expect((await call(meRoute, "GET", undefined, { cookie: res.cookie })).body.user.username).toBe(username);
  });

  it("gives the same answer for a wrong password and an unknown user, and logs both", async () => {
    const { username } = await newUser();
    const wrong = await call(loginRoute, "POST", { username, password: "not the password" });
    const unknown = await call(loginRoute, "POST", { username: "nobody-here", password: "whatever123" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
    const events = await db.select().from(authEvents);
    expect(events.filter((e) => e.type === "login_failed").length).toBeGreaterThanOrEqual(2);
  });

  it("logout ends the session and clears the cookie", async () => {
    const { cookie } = await newUser();
    const out = await call(logoutRoute, "POST", undefined, { cookie });
    expect(out.status).toBe(204);
    expect(out.setCookie).toContain("Max-Age=0");
    expect((await call(meRoute, "GET", undefined, { cookie })).body.user).toBeNull();
    expect((await call(dataRoute, "GET", undefined, { cookie })).status).toBe(401);
  });

  it("rate-limits repeated failures for one username, with Retry-After", async () => {
    const { username } = await newUser();
    let last;
    for (let i = 0; i < 11; i++)
      last = await call(loginRoute, "POST", { username, password: "wrong password" }, { ip: `192.0.2.${i}` });
    expect(last!.status).toBe(429);
    expect(Number(last!.headers.get("retry-after"))).toBeGreaterThan(0);
  });
});

describe("cross-site protection", () => {
  it("rejects state-changing requests from another origin or with no origin", async () => {
    const evil = await call(
      signupRoute,
      "POST",
      { username: "victim1", password: "long enough pw" },
      { origin: "https://evil.example" },
    );
    expect(evil.status).toBe(403);
    const none = await call(loginRoute, "POST", { username: "x", password: "y" }, { origin: null });
    expect(none.status).toBe(403);
  });
});

describe("recovery codes", () => {
  it("reset works once per code, signs out other sessions, and accepts messy formatting", async () => {
    const { username, cookie, codes } = await newUser();
    const messy = codes[0].toUpperCase().replace(/-/g, " ");
    const res = await call(resetRoute, "POST", { username, code: messy, newPassword: "brand new passphrase" });
    expect(res.status).toBe(200);
    expect(res.body.codesLeft).toBe(7);
    expect((await call(meRoute, "GET", undefined, { cookie })).body.user).toBeNull();
    expect((await call(meRoute, "GET", undefined, { cookie: res.cookie })).body.user.username).toBe(username);

    const again = await call(resetRoute, "POST", { username, code: codes[0], newPassword: "yet another passphrase" });
    expect(again.status).toBe(401);
    expect((await call(loginRoute, "POST", { username, password: "brand new passphrase" })).status).toBe(200);
  });

  it("rejects a code that belongs to someone else", async () => {
    const a = await newUser();
    const b = await newUser();
    const res = await call(resetRoute, "POST", {
      username: a.username,
      code: b.codes[0],
      newPassword: "takeover attempt!",
    });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("That username and recovery code do not match.");
  });

  it("regenerating codes needs the password and invalidates the old ones", async () => {
    const { username, password, cookie, codes } = await newUser();
    expect((await call(codesRoute, "POST", { password: "wrong" }, { cookie })).status).toBe(401);
    const res = await call(codesRoute, "POST", { password }, { cookie });
    expect(res.body.recoveryCodes).toHaveLength(8);
    const old = await call(resetRoute, "POST", { username, code: codes[1], newPassword: "should not work" });
    expect(old.status).toBe(401);
  });

  it("generates well-formed codes and normalizes input", () => {
    expect(recoveryCode()).toMatch(/^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
    expect(normalizeRecoveryCode(" AB2C dEf3-GH4J ")).toBe("ab2c-def3-gh4j");
  });
});

describe("sessions", () => {
  it("expire after 30 days and renew when less than 15 days remain", async () => {
    const { username } = await newUser();
    const [user] = await db
      .select()
      .from(users)
      .where((await import("drizzle-orm")).eq(users.username, username));
    const start = new Date("2026-01-01T00:00:00Z");
    const { token } = await createSession(db, user.id, start);

    const day10 = await validateSession(db, token, new Date(start.getTime() + 10 * 86_400_000));
    expect(day10?.renewed).toBe(false);
    const day20 = await validateSession(db, token, new Date(start.getTime() + 20 * 86_400_000));
    expect(day20?.renewed).toBe(true);
    expect(day20!.expiresAt.getTime()).toBe(start.getTime() + 20 * 86_400_000 + SESSION_TTL);

    const expired = await validateSession(db, token, new Date(day20!.expiresAt.getTime() + 1));
    expect(expired).toBeNull();
  });
});

describe("rate limiter", () => {
  it("allows max hits per window and restarts after it", async () => {
    const limit = { max: 2, windowSeconds: 60 };
    const t0 = new Date("2026-01-01T00:00:00Z");
    expect(await hit(db, "test:k", limit, t0)).toBeNull();
    expect(await hit(db, "test:k", limit, new Date(t0.getTime() + 1000))).toBeNull();
    expect(await hit(db, "test:k", limit, new Date(t0.getTime() + 2000))).toBe(58);
    expect(await hit(db, "test:k", limit, new Date(t0.getTime() + 61_000))).toBeNull();
  });
});

describe("saved data", () => {
  const plan = [{ id: "e1", day: 0, meal: "dinner", slug: "biryani", servings: 4 }];

  it("replaces and reads back each collection", async () => {
    const { cookie } = await newUser();
    expect((await call(pantryRoute, "PUT", { have: ["rice", "eggs"], low: ["eggs"] }, { cookie })).status).toBe(204);
    expect((await call(planRoute, "PUT", { entries: plan }, { cookie })).status).toBe(204);
    const data = await call(dataRoute, "GET", undefined, { cookie });
    expect(data.body).toEqual({ pantry: { have: ["eggs", "rice"], low: ["eggs"] }, plan, favorites: [], checked: [] });
  });

  it("validates saved data", async () => {
    const { cookie } = await newUser();
    const bad = await call(pantryRoute, "PUT", { have: ["unicorn", "water"], low: ["rice"] }, { cookie });
    expect(bad.status).toBe(400);
    expect(Object.keys(bad.body.error.fields).sort()).toEqual(["have.0", "have.1", "low"]);
    const badPlan = await call(planRoute, "PUT", { entries: [{ ...plan[0], slug: "nope", day: 9 }] }, { cookie });
    expect(Object.keys(badPlan.body.error.fields).sort()).toEqual(["entries.0.day", "entries.0.slug"]);
  });

  it("merges browser data into the account on first sign-in", async () => {
    const { cookie } = await newUser();
    await call(pantryRoute, "PUT", { have: ["rice"], low: [] }, { cookie });
    await call(planRoute, "PUT", { entries: plan }, { cookie });
    const local = {
      pantry: { have: ["eggs"], low: ["eggs"] },
      plan: [
        { ...plan[0], servings: 1 },
        { id: "e2", day: 3, meal: "lunch", slug: "noodle-soup", servings: 2 },
      ],
      favorites: ["biryani"],
      checked: ["milk"],
    };
    const merged = await call(mergeRoute, "POST", local, { cookie });
    expect(merged.body.pantry).toEqual({ have: ["rice", "eggs"], low: ["eggs"] });
    // Same entry id on both sides: the account's version wins.
    expect(merged.body.plan.map((e: { id: string; servings: number }) => [e.id, e.servings])).toEqual([
      ["e1", 4],
      ["e2", 2],
    ]);
    expect((await call(dataRoute, "GET", undefined, { cookie })).body).toMatchObject({
      favorites: ["biryani"],
      checked: ["milk"],
    });
  });

  it("keeps plan entry ids separate per user, so one user cannot block another's saves", async () => {
    const a = await newUser();
    const b = await newUser();
    expect((await call(planRoute, "PUT", { entries: plan }, { cookie: a.cookie })).status).toBe(204);
    expect((await call(planRoute, "PUT", { entries: plan }, { cookie: b.cookie })).status).toBe(204);
    expect((await call(dataRoute, "GET", undefined, { cookie: b.cookie })).body.plan).toEqual(plan);
  });

  it("drops stale or invalid browser items during a merge instead of failing", async () => {
    const { cookie } = await newUser();
    const merged = await call(
      mergeRoute,
      "POST",
      {
        pantry: { have: ["rice", "unicorn"], low: ["unicorn"] },
        plan: [{ id: "x", slug: "gone" }],
        favorites: ["biryani", "deleted-recipe"],
        checked: [5],
      },
      { cookie },
    );
    expect(merged.status).toBe(200);
    expect(merged.body).toEqual({ pantry: { have: ["rice"], low: [] }, plan: [], favorites: ["biryani"], checked: [] });
  });

  it("requires a session", async () => {
    expect((await call(pantryRoute, "PUT", { have: [], low: [] })).status).toBe(401);
  });

  it("deleting the account removes all of its data", async () => {
    const { username, password, cookie } = await newUser();
    await call(pantryRoute, "PUT", { have: ["rice"], low: [] }, { cookie });
    expect((await call(deleteMeRoute, "DELETE", { password: "wrong" }, { cookie })).status).toBe(401);
    expect((await call(deleteMeRoute, "DELETE", { password }, { cookie })).status).toBe(204);
    expect((await call(loginRoute, "POST", { username, password })).status).toBe(401);
    const leftovers = await db.execute(
      "select count(*)::int as n from pantry_items where user_id not in (select id from users)",
    );
    expect((leftovers as unknown as { rows: { n: number }[] }).rows[0].n).toBe(0);
  });
});
