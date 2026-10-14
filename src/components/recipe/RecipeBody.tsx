"use client";

import { useMemo, useState } from "react";
import { useMyPantry } from "@/client/my-pantry";
import type { Meal, RecipeIngredient, Substitution } from "@/data/schema";
import { useDict, useLang } from "@/i18n/client";
import { ingredientName, subNote } from "@/i18n/ingredients";
import { dietsFor } from "@/lib/diet";
import { related } from "@/lib/match";
import { costPerServing, nutritionPerServing } from "@/lib/nutrition";
import { formatIngredientLine, scaleAmount } from "@/lib/scale";
import { toggled } from "@/lib/sets";
import { applySub, resolveSubs } from "@/lib/substitute";
import ui from "../ui.module.css";
import { AddToPlan } from "./AddToPlan";
import { CookMode } from "./CookMode";
import { IngredientRow } from "./IngredientRow";
import { NutritionPanel } from "./NutritionPanel";
import styles from "./RecipeBody.module.css";
import { ServingsStepper } from "./ServingsStepper";

interface Props {
  slug: string;
  title: string;
  meal: Meal;
  ingredients: RecipeIngredient[];
  /** Ingredient notes in the page language, keyed by ingredient id. */
  notes: Record<string, string>;
  steps: string[];
  baseServings: number;
  /** Generated recipes are not in the catalog, so they cannot go on the meal plan. */
  plannable?: boolean;
}

/**
 * The interactive part of a recipe page: ingredients that rescale with the servings
 * stepper, per-ingredient swaps, a checklist, nutrition and cost, the steps, and cook mode.
 */
export function RecipeBody({ slug, title, meal, ingredients, notes, steps, baseServings, plannable = true }: Props) {
  const d = useDict();
  const t = d.recipe;
  const lang = useLang();
  const { pantry } = useMyPantry();
  const [servings, setServings] = useState(baseServings);
  /** Chosen swaps, keyed by the ingredient's position in the recipe. */
  const [swaps, setSwaps] = useState<Record<number, Substitution>>({});
  const [checked, setChecked] = useState<ReadonlySet<number>>(new Set());
  const [cooking, setCooking] = useState(false);

  // The ingredient list with swaps applied; everything below is derived from it.
  const current = useMemo(
    () => ingredients.map((ing, i) => (swaps[i] ? applySub(ing, swaps[i]) : ing)),
    [ingredients, swaps],
  );
  const factor = servings / baseServings;
  const lineFor = (ing: RecipeIngredient) => formatIngredientLine(ing.id, scaleAmount(ing, factor), lang);
  const name = (id: string) => ingredientName(id, lang);

  const undoSwap = (i: number) =>
    setSwaps((prev) => {
      const next = { ...prev };
      delete next[i];
      return next;
    });

  const swapped = Object.entries(swaps).map(([i, s]) => ({ from: ingredients[Number(i)].id, to: s.id }));

  return (
    <div className={styles.layout}>
      <section className={`${ui.card} ${styles.ingredients}`} aria-labelledby="ingredients-heading">
        <div className={styles.ingHeader}>
          <h2 id="ingredients-heading">{t.ingredients}</h2>
          <ServingsStepper value={servings} onChange={setServings} />
        </div>

        <ul className={styles.ingList}>
          {current.map((ing, i) => {
            const original = ingredients[i];
            const swap = swaps[i];
            return (
              <IngredientRow
                key={original.id}
                line={lineFor(ing)}
                ingredient={ing}
                originalId={original.id}
                // A swap's own note replaces the recipe's note for that line.
                note={swap?.note ? subNote(swap.note, lang) : notes[original.id]}
                swapOptions={resolveSubs(original)}
                swapped={Boolean(swap)}
                inPantry={pantry.have.some((h) => related(ing.id, h))}
                checked={checked.has(i)}
                onToggleChecked={() => setChecked((prev) => toggled(prev, i))}
                onSwap={(option) => setSwaps((prev) => ({ ...prev, [i]: option }))}
                onUndoSwap={() => undoSwap(i)}
              />
            );
          })}
        </ul>

        {swapped.length > 0 && (
          <p className={styles.swapReminder} role="status" data-testid="swap-reminder">
            {swapped.map((s) => t.swapReminder(name(s.to), name(s.from))).join(" ")}
          </p>
        )}

        <NutritionPanel
          nutrition={nutritionPerServing(current, baseServings)}
          costPerServing={costPerServing(current, baseServings)}
          servings={servings}
          diets={dietsFor(current)}
        />

        {plannable && <AddToPlan slug={slug} title={title} servings={servings} defaultMeal={meal} />}
      </section>

      <section className={styles.steps} aria-labelledby="steps-heading">
        <div className={styles.stepsHeader}>
          <h2 id="steps-heading">{t.steps}</h2>
          <button type="button" className={`${ui.button} ${ui.primary} no-print`} onClick={() => setCooking(true)}>
            {t.startCooking}
          </button>
        </div>
        <ol className={styles.stepList}>
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {cooking && (
        <CookMode
          title={title}
          steps={steps}
          ingredientLines={current.map((ing) => ({
            id: ing.id,
            line: lineFor(ing) + (ing.optional ? d.cook.optional : ""),
          }))}
          onClose={() => setCooking(false)}
        />
      )}
    </div>
  );
}
