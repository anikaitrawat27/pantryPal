"use client";

import { useMemo, useState } from "react";
import { getIngredient } from "@/data/pantry";
import type { Meal, RecipeIngredient, Substitution } from "@/data/schema";
import { DIET_LABELS, dietsFor } from "@/lib/diet";
import { related } from "@/lib/match";
import { useMyPantry } from "@/lib/my-pantry";
import { costPerServing, formatUsd, nutritionPerServing } from "@/lib/nutrition";
import { formatIngredientLine, scaleAmount } from "@/lib/scale";
import { applySub, resolveSubs } from "@/lib/substitute";
import { AddToPlan } from "./AddToPlan";
import { CookMode } from "./CookMode";
import styles from "./RecipeBody.module.css";
import { ServingsStepper } from "./ServingsStepper";
import ui from "./ui.module.css";

interface Props {
  slug: string;
  title: string;
  meal: Meal;
  ingredients: RecipeIngredient[];
  steps: string[];
  baseServings: number;
}

/** Ingredients and steps, with live serving-size scaling, swaps, and a checklist. */
export function RecipeBody({ slug, title, meal, ingredients, steps, baseServings }: Props) {
  const [servings, setServings] = useState(baseServings);
  const [swaps, setSwaps] = useState<Record<number, Substitution>>({});
  const [openSwap, setOpenSwap] = useState<number | null>(null);
  const [checked, setChecked] = useState<ReadonlySet<number>>(new Set());
  const [cooking, setCooking] = useState(false);
  const { pantry } = useMyPantry();
  const inPantry = (id: string) => pantry.have.some((h) => related(id, h));

  const current = useMemo(
    () => ingredients.map((ing, i) => (swaps[i] ? applySub(ing, swaps[i]) : ing)),
    [ingredients, swaps],
  );
  const diets = useMemo(() => dietsFor(current), [current]);
  const nutrition = useMemo(() => nutritionPerServing(current, baseServings), [current, baseServings]);
  const cost = useMemo(() => costPerServing(current, baseServings), [current, baseServings]);
  const factor = servings / baseServings;
  const swapped = Object.entries(swaps).map(([i, s]) => ({ from: ingredients[Number(i)].id, to: s.id }));

  const toggleChecked = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className={styles.layout}>
      <section className={`${ui.card} ${styles.ingredients}`} aria-labelledby="ingredients-heading">
        <div className={styles.ingHeader}>
          <h2 id="ingredients-heading">Ingredients</h2>
          <ServingsStepper value={servings} onChange={setServings} />
        </div>

        <ul className={styles.ingList}>
          {current.map((ing, i) => {
            const original = ingredients[i];
            const options = resolveSubs(original);
            const isSwapped = Boolean(swaps[i]);
            const line = formatIngredientLine(ing.id, scaleAmount(ing, factor));
            return (
              <li key={original.id} className={styles.ingItem} data-checked={checked.has(i)}>
                <label className={styles.check}>
                  <input type="checkbox" checked={checked.has(i)} onChange={() => toggleChecked(i)} />
                  <span>
                    <span className={styles.line} data-testid={`ing-${original.id}`}>
                      {line}
                    </span>
                    {ing.note && <span className={styles.note}> ({ing.note})</span>}
                    {ing.optional && <span className={styles.optional}>optional</span>}
                    {getIngredient(ing.id).tier === "extra" && <span className={styles.extra}>extra</span>}
                    {inPantry(ing.id) && <span className={styles.have}>in your pantry</span>}
                  </span>
                </label>

                {(options.length > 0 || isSwapped) && (
                  <div className={`${styles.swap} no-print`}>
                    {isSwapped ? (
                      <button
                        type="button"
                        className={styles.swapBtn}
                        onClick={() =>
                          setSwaps((s) => {
                            const next = { ...s };
                            delete next[i];
                            return next;
                          })
                        }
                      >
                        undo swap
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.swapBtn}
                        aria-expanded={openSwap === i}
                        aria-controls={`swap-${i}`}
                        onClick={() => setOpenSwap(openSwap === i ? null : i)}
                      >
                        swap
                      </button>
                    )}
                    {openSwap === i && !isSwapped && (
                      <ul
                        id={`swap-${i}`}
                        className={styles.swapMenu}
                        onKeyDown={(e) => e.key === "Escape" && setOpenSwap(null)}
                        aria-label={`Swaps for ${getIngredient(original.id).name}`}
                      >
                        {options.map((o) => (
                          <li key={o.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSwaps((s) => ({ ...s, [i]: o }));
                                setOpenSwap(null);
                              }}
                            >
                              Use {getIngredient(o.id).name}
                              {o.note && <span className={styles.subNote}>{o.note}</span>}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {swapped.length > 0 && (
          <p className={styles.swapReminder} role="status" data-testid="swap-reminder">
            {swapped
              .map((s) => `Use ${getIngredient(s.to).name} wherever the steps say ${getIngredient(s.from).name}.`)
              .join(" ")}
          </p>
        )}

        <dl className={styles.nutrition} aria-label="Estimated per serving">
          <div>
            <dt>Calories</dt>
            <dd>{nutrition.kcal}</dd>
          </div>
          <div>
            <dt>Protein</dt>
            <dd>{nutrition.protein} g</dd>
          </div>
          <div>
            <dt>Fiber</dt>
            <dd>{nutrition.fiber} g</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd data-testid="cost-per-serving">{formatUsd(cost)}</dd>
          </div>
        </dl>
        <p className={styles.estimate}>
          Estimates per serving. {servings} {servings === 1 ? "serving costs" : "servings cost"} about{" "}
          {formatUsd(cost * servings)} if you buy everything.
        </p>

        <div className={styles.diets} aria-label="Diet">
          {diets.map((d) => (
            <span key={d} className={`${ui.badge} ${ui.badgeSage}`}>
              {DIET_LABELS[d]}
            </span>
          ))}
        </div>

        <AddToPlan slug={slug} title={title} servings={servings} defaultMeal={meal} />
      </section>

      <section className={styles.steps} aria-labelledby="steps-heading">
        <div className={styles.stepsHeader}>
          <h2 id="steps-heading">Steps</h2>
          <button type="button" className={`${ui.button} ${ui.primary} no-print`} onClick={() => setCooking(true)}>
            Start cooking
          </button>
        </div>
        <ol className={styles.stepList}>
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      {cooking && (
        <CookMode
          title={title}
          steps={steps}
          ingredientLines={current.map((ing) => ({
            id: ing.id,
            line: formatIngredientLine(ing.id, scaleAmount(ing, factor)) + (ing.optional ? " (optional)" : ""),
          }))}
          onClose={() => setCooking(false)}
        />
      )}
    </div>
  );
}
