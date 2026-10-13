"use client";

import { getIngredient } from "@/data/pantry";
import type { RecipeIngredient } from "@/data/schema";
import { matchPantry } from "@/lib/match";
import { useMyPantry } from "@/lib/my-pantry";
import styles from "./RecipeCard.module.css";

/** Shows how a recipe compares to the saved pantry. Renders nothing until a pantry is saved. */
export function PantryStatus({ ingredients }: { ingredients: readonly RecipeIngredient[] }) {
  const { pantry } = useMyPantry();
  if (pantry.have.length === 0) return null;
  const { missing, swaps } = matchPantry(ingredients, pantry.have);
  if (missing.length === 0) {
    return <p className={styles.ready}>{swaps.length ? `You have everything (with ${swaps.length} swap${swaps.length > 1 ? "s" : ""})` : "You have everything"}</p>;
  }
  const names = missing.map((id) => getIngredient(id).name);
  return (
    <p className={styles.need}>
      Missing {missing.length}: {names.slice(0, 3).join(", ")}
      {names.length > 3 ? "…" : ""}
    </p>
  );
}
