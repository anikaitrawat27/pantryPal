"use client";

import type { Diet } from "@/lib/diet";
import { useDict } from "@/i18n/client";
import { formatUsd, type Nutrition } from "@/lib/nutrition";
import ui from "../ui.module.css";
import styles from "./RecipeBody.module.css";

/** Calories, protein, fiber, and cost per serving, plus the diet labels. All recalculated after swaps. */
export function NutritionPanel({
  nutrition,
  costPerServing,
  servings,
  diets,
}: {
  nutrition: Nutrition;
  costPerServing: number;
  servings: number;
  diets: Diet[];
}) {
  const d = useDict();
  const t = d.recipe;
  return (
    <>
      <dl className={styles.nutrition} aria-label={t.perServing}>
        <div>
          <dt>{t.calories}</dt>
          <dd>{nutrition.kcal}</dd>
        </div>
        <div>
          <dt>{t.protein}</dt>
          <dd>{nutrition.protein} g</dd>
        </div>
        <div>
          <dt>{t.fiber}</dt>
          <dd>{nutrition.fiber} g</dd>
        </div>
        <div>
          <dt>{t.cost}</dt>
          <dd data-testid="cost-per-serving">{formatUsd(costPerServing)}</dd>
        </div>
      </dl>
      <p className={styles.estimate}>{t.estimate(servings, formatUsd(costPerServing * servings))}</p>
      <div className={styles.diets} aria-label={t.diet}>
        {diets.map((diet) => (
          <span key={diet} className={`${ui.badge} ${ui.badgeSage}`}>
            {d.diets[diet]}
          </span>
        ))}
      </div>
    </>
  );
}
