import { describe, expect, it } from "vitest";
import { checkCredentials, safeNext } from "@/lib/account-rules";

describe("checkCredentials", () => {
  it("accepts valid credentials", () => {
    expect(checkCredentials("maria_g", "a long passphrase")).toEqual([]);
  });

  it("flags each problem", () => {
    expect(checkCredentials("ab", "short")).toEqual(["username", "password"]);
    expect(checkCredentials("has space", "long enough!")).toEqual(["username"]);
    expect(checkCredentials("SameSame12", "samesame12")).toEqual(["same"]);
  });
});

describe("safeNext", () => {
  it("allows same-site paths only", () => {
    expect(safeNext("/plan", "/")).toBe("/plan");
    expect(safeNext("/es/pantry?x=1", "/")).toBe("/es/pantry?x=1");
    expect(safeNext("https://evil.example", "/")).toBe("/");
    expect(safeNext("//evil.example", "/")).toBe("/");
    expect(safeNext("/\\evil.example", "/")).toBe("/");
    expect(safeNext(null, "/pantry")).toBe("/pantry");
  });
});
