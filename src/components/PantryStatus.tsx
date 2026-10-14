"use client";

import type { RecipeIngredient } from "@/data/schema";
import { useDict, useLang } from "@/i18n/client";
import { ingredientName } from "@/i18n/ingredients";
import { matchPantry } from "@/lib/match";
import { useMyPantry } from "@/client/my-pantry";
import styles from "./RecipeCard.module.css";

/** Shows how a recipe compares to the saved pantry. Renders nothing until a pantry is saved. */
export function PantryStatus({ ingredients }: { ingredients: readonly RecipeIngredient[] }) {
  const t = useDict().card;
  const lang = useLang();
  const { pantry } = useMyPantry();
  if (pantry.have.length === 0) return null;
  const { missing, swaps } = matchPantry(ingredients, pantry.have);
  if (missing.length === 0)
    return <p className={styles.ready}>{swaps.length ? t.readyWithSwaps(swaps.length) : t.ready}</p>;
  const names = missing.map((id) => ingredientName(id, lang));
  return (
    <p className={styles.need}>
      {t.missingN(missing.length)}: {names.slice(0, 3).join(", ")}
      {names.length > 3 ? "…" : ""}
    </p>
  );
}
