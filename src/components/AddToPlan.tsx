"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { MEALS, type Meal } from "@/data/schema";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { usePlan } from "@/lib/plan-store";
import styles from "./AddToPlan.module.css";
import ui from "./ui.module.css";

/** Today's index with Monday as 0, matching the plan's day numbering. */
const today = () => (new Date().getDay() + 6) % 7;

export function AddToPlan({
  slug,
  title,
  servings,
  defaultMeal,
}: {
  slug: string;
  title: string;
  servings: number;
  defaultMeal: Meal;
}) {
  const { add } = usePlan();
  const lang = useLang();
  const d = useDict();
  const t = d.addToPlan;
  const id = useId();
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState(today);
  const [meal, setMeal] = useState<Meal>(defaultMeal);
  const [added, setAdded] = useState<string | null>(null);

  return (
    <div className={`${styles.wrap} no-print`}>
      <button
        type="button"
        className={ui.button}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {t.button}
      </button>
      {open && (
        <form
          id={id}
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            add(slug, day, meal, servings);
            setAdded(`${d.plan.days[day]} (${d.meals[meal].toLowerCase()})`);
            setOpen(false);
          }}
        >
          <label>
            {t.day}
            <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {d.plan.days.map((dayName, i) => (
                <option key={dayName} value={i}>
                  {dayName}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.meal}
            <select value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
              {MEALS.map((m) => (
                <option key={m} value={m}>
                  {d.meals[m]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={`${ui.button} ${ui.primary}`}>
            {t.submit(servings)}
          </button>
        </form>
      )}
      {added && (
        <p className={styles.added} role="status">
          {t.added(title, added)} <Link href={localePath(lang, "/plan")}>{t.see}</Link>
        </p>
      )}
    </div>
  );
}
