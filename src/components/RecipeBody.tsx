"use client";

import { useMemo, useState } from "react";
import { getIngredient } from "@/data/pantry";
import type { Meal, RecipeIngredient, Substitution } from "@/data/schema";
import { useDict, useLang } from "@/i18n/client";
import { ingredientName, subNote } from "@/i18n/ingredients";
import { dietsFor } from "@/lib/diet";
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
  /** Ingredient notes in the page language, keyed by ingredient id. */
  notes: Record<string, string>;
  steps: string[];
  baseServings: number;
}

/** Ingredients and steps, with live serving-size scaling, swaps, and a checklist. */
export function RecipeBody({ slug, title, meal, ingredients, notes, steps, baseServings }: Props) {
  const lang = useLang();
  const d = useDict();
  const t = d.recipe;
  const name = (id: string) => ingredientName(id, lang);
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
          <h2 id="ingredients-heading">{t.ingredients}</h2>
          <ServingsStepper value={servings} onChange={setServings} />
        </div>

        <ul className={styles.ingList}>
          {current.map((ing, i) => {
            const original = ingredients[i];
            const options = resolveSubs(original);
            const isSwapped = Boolean(swaps[i]);
            const line = formatIngredientLine(ing.id, scaleAmount(ing, factor), lang);
            const sub = swaps[i];
            const note = sub ? (sub.note ? subNote(sub.note, lang) : notes[original.id]) : notes[original.id];
            return (
              <li key={original.id} className={styles.ingItem} data-checked={checked.has(i)}>
                <label className={styles.check}>
                  <input type="checkbox" checked={checked.has(i)} onChange={() => toggleChecked(i)} />
                  <span>
                    <span className={styles.line} data-testid={`ing-${original.id}`}>
                      {line}
                    </span>
                    {note && <span className={styles.note}> ({note})</span>}
                    {ing.optional && <span className={styles.optional}>{t.optional}</span>}
                    {getIngredient(ing.id).tier === "extra" && <span className={styles.extra}>{t.extra}</span>}
                    {inPantry(ing.id) && <span className={styles.have}>{t.inPantry}</span>}
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
                        {t.undoSwap}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.swapBtn}
                        aria-expanded={openSwap === i}
                        aria-controls={`swap-${i}`}
                        onClick={() => setOpenSwap(openSwap === i ? null : i)}
                      >
                        {t.swap}
                      </button>
                    )}
                    {openSwap === i && !isSwapped && (
                      <ul
                        id={`swap-${i}`}
                        className={styles.swapMenu}
                        onKeyDown={(e) => e.key === "Escape" && setOpenSwap(null)}
                        aria-label={t.swapsFor(name(original.id))}
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
                              {t.use(name(o.id))}
                              {o.note && <span className={styles.subNote}>{subNote(o.note, lang)}</span>}
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
            {swapped.map((s) => t.swapReminder(name(s.to), name(s.from))).join(" ")}
          </p>
        )}

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
            <dd data-testid="cost-per-serving">{formatUsd(cost)}</dd>
          </div>
        </dl>
        <p className={styles.estimate}>{t.estimate(servings, formatUsd(cost * servings))}</p>

        <div className={styles.diets} aria-label={t.diet}>
          {diets.map((diet) => (
            <span key={diet} className={`${ui.badge} ${ui.badgeSage}`}>
              {d.diets[diet]}
            </span>
          ))}
        </div>

        <AddToPlan slug={slug} title={title} servings={servings} defaultMeal={meal} />
      </section>

      <section className={styles.steps} aria-labelledby="steps-heading">
        <div className={styles.stepsHeader}>
          <h2 id="steps-heading">{t.steps}</h2>
          <button type="button" className={`${ui.button} ${ui.primary} no-print`} onClick={() => setCooking(true)}>
            {t.startCooking}
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
            line: formatIngredientLine(ing.id, scaleAmount(ing, factor), lang) + (ing.optional ? d.cook.optional : ""),
          }))}
          onClose={() => setCooking(false)}
        />
      )}
    </div>
  );
}
