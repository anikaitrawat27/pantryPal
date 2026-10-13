import { describe, expect, it } from "vitest";
import { RECIPES } from "@/lib/catalog";
import { formatClock, parseTimers } from "@/lib/timers";

describe("parseTimers", () => {
  it.each([
    ["Simmer for 10 minutes.", [{ label: "10 minutes", seconds: 600 }]],
    ["Cook for 8 to 10 minutes, until golden.", [{ label: "8 to 10 minutes", seconds: 480 }]],
    ["Microwave for 60 to 90 seconds.", [{ label: "60 to 90 seconds", seconds: 60 }]],
    ["Microwave for 1 1/2 minutes.", [{ label: "1 1/2 minutes", seconds: 90 }]],
    ["Microwave for one and a half minutes.", [{ label: "one and a half minutes", seconds: 90 }]],
    ["Rest for a minute.", [{ label: "a minute", seconds: 60 }]],
    ["Cook for 1 hour.", [{ label: "1 hour", seconds: 3600 }]],
    ["Cook 4-5 min per side.", [{ label: "4-5 min", seconds: 240 }]],
    ["Cocine a fuego lento por 10 minutos.", [{ label: "10 minutos", seconds: 600 }]],
    ["Cocine de 8 a 10 minutos, hasta que dore.", [{ label: "8 a 10 minutos", seconds: 480 }]],
    ["Caliente en el microondas por un minuto y medio.", [{ label: "un minuto y medio", seconds: 90 }]],
    ["Deje reposar dos minutos.", [{ label: "dos minutos", seconds: 120 }]],
    ["Cocine por 1 hora.", [{ label: "1 hora", seconds: 3600 }]],
  ])("%s", (step, expected) => {
    expect(parseTimers(step)).toEqual(expected);
  });

  it("finds several times in one step", () => {
    expect(parseTimers("Boil for 5 minutes, then rest for 10 minutes.").map((t) => t.seconds)).toEqual([300, 600]);
  });

  it("ignores steps without times and very long waits", () => {
    expect(parseTimers("Stir in the cheese until melted.")).toEqual([]);
    expect(parseTimers("Chill for 8 hours or overnight.")).toEqual([]);
  });

  it("does not mistake temperatures or amounts for times", () => {
    expect(parseTimers("Air fry at 350°F until crisp.")).toEqual([]);
  });

  it("finds a timer in most recipes that cook", () => {
    const cooking = RECIPES.filter((r) => r.cook > 0);
    const withTimer = cooking.filter((r) => r.steps.some((s) => parseTimers(s).length > 0));
    expect(withTimer.length / cooking.length).toBeGreaterThan(0.9);
  });
});

describe("formatClock", () => {
  it("formats minutes and hours", () => {
    expect(formatClock(75)).toBe("1:15");
    expect(formatClock(5)).toBe("0:05");
    expect(formatClock(3725)).toBe("1:02:05");
    expect(formatClock(-3)).toBe("0:00");
  });
});
