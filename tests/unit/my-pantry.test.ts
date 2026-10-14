import { describe, expect, it } from "vitest";
import { parseMyPantry, setLow, toggleHave } from "@/client/my-pantry";

describe("my pantry", () => {
  it("parses stored data and drops unknown, free, duplicate, and orphaned low items", () => {
    expect(parseMyPantry({ have: ["rice", "rice", "unicorn", "water", 5], low: ["rice", "eggs"] })).toEqual({
      have: ["rice"],
      low: ["rice"],
    });
  });

  it("treats malformed data as empty", () => {
    expect(parseMyPantry(null)).toEqual({ have: [], low: [] });
    expect(parseMyPantry("rice")).toEqual({ have: [], low: [] });
  });

  it("removes the low flag when an item is removed", () => {
    expect(toggleHave({ have: ["rice"], low: ["rice"] }, "rice")).toEqual({ have: [], low: [] });
    expect(toggleHave({ have: [], low: [] }, "eggs")).toEqual({ have: ["eggs"], low: [] });
  });

  it("only marks owned items as low", () => {
    const p = setLow({ have: ["rice", "eggs"], low: [] }, ["rice", "milk"], true);
    expect(p.low).toEqual(["rice"]);
    expect(setLow(p, ["rice"], false).low).toEqual([]);
  });
});
