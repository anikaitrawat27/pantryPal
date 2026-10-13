import { describe, expect, it } from "vitest";
import { FACTS } from "@/data/facts";
import { INGREDIENTS } from "@/data/pantry";
import { GLOBAL_SUBSTITUTIONS } from "@/data/substitutions";
import { langFromPath, localePath, switchLangPath } from "@/i18n/config";
import { INGREDIENTS_ES } from "@/i18n/es/ingredients";
import { hasPackLabelEs, hasSubNoteEs, packLabel } from "@/i18n/ingredients";
import { RECIPES } from "@/lib/catalog";

describe("locale paths", () => {
  it("keeps English at the root and Spanish under /es", () => {
    expect(localePath("en", "/recipes")).toBe("/recipes");
    expect(localePath("es", "/recipes")).toBe("/es/recipes");
    expect(localePath("es", "/")).toBe("/es");
  });

  it("detects the language of a path", () => {
    expect(langFromPath("/es")).toBe("es");
    expect(langFromPath("/es/recipes/biryani")).toBe("es");
    expect(langFromPath("/essentials")).toBe("en");
    expect(langFromPath("/")).toBe("en");
  });

  it("switches between languages on the same page", () => {
    expect(switchLangPath("/recipes/biryani", "es")).toBe("/es/recipes/biryani");
    expect(switchLangPath("/es/recipes/biryani", "en")).toBe("/recipes/biryani");
    expect(switchLangPath("/es", "en")).toBe("/");
    expect(switchLangPath("/", "es")).toBe("/es");
  });
});

describe("Spanish coverage", () => {
  it("names every ingredient", () => {
    for (const ing of INGREDIENTS) expect(INGREDIENTS_ES[ing.id]?.name, ing.id).toBeTruthy();
  });

  it("translates every swap note and package label", () => {
    const notes = new Set<string>();
    for (const subs of Object.values(GLOBAL_SUBSTITUTIONS)) for (const s of subs) if (s.note) notes.add(s.note);
    for (const r of RECIPES) for (const i of r.ingredients) for (const s of i.subs ?? []) if (s.note) notes.add(s.note);
    for (const n of notes) expect(hasSubNoteEs(n), n).toBe(true);
    for (const f of Object.values(FACTS)) if (f.pack) expect(hasPackLabelEs(f.pack.label), f.pack.label).toBe(true);
  });

  it("translates package labels", () => {
    expect(packLabel("15 oz can", "es")).toBe("lata de 15 oz");
    expect(packLabel("1 dozen", "es")).toBe("1 docena");
    expect(packLabel("15 oz can", "en")).toBe("15 oz can");
  });
});
