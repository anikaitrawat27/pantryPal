"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { MEALS, type Meal } from "@/data/schema";
import { MEAL_LABELS } from "@/lib/labels";
import { DAYS } from "@/lib/plan";
import { usePlan } from "@/lib/plan-store";
import styles from "./AddToPlan.module.css";
import ui from "./ui.module.css";

/** Today's index with Monday as 0, matching the plan's day numbering. */
const today = () => (new Date().getDay() + 6) % 7;

export function AddToPlan({ slug, title, servings, defaultMeal }: { slug: string; title: string; servings: number; defaultMeal: Meal }) {
  const { add } = usePlan();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(today);
  const [meal, setMeal] = useState<Meal>(defaultMeal);
  const [added, setAdded] = useState<string | null>(null);

  return (
    <div className={`${styles.wrap} no-print`}>
      <button type="button" className={ui.button} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        Add to plan
      </button>
      {open && (
        <form
          id={id}
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            add(slug, day, meal, servings);
            setAdded(`${DAYS[day]} ${MEAL_LABELS[meal].toLowerCase()}`);
            setOpen(false);
          }}
        >
          <label>
            Day
            <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label>
            Meal
            <select value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
              {MEALS.map((m) => (
                <option key={m} value={m}>
                  {MEAL_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={`${ui.button} ${ui.primary}`}>
            Add {servings} {servings === 1 ? "serving" : "servings"}
          </button>
        </form>
      )}
      {added && (
        <p className={styles.added} role="status">
          Added {title} to {added}. <Link href="/plan">See plan</Link>
        </p>
      )}
    </div>
  );
}
