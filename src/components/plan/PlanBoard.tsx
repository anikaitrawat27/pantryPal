"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMyPantry } from "@/client/my-pantry";
import { usePlan } from "@/client/plan-store";
import { MEALS, type Meal } from "@/data/schema";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import type { RecipeSummary } from "@/lib/catalog";
import { formatUsd } from "@/lib/nutrition";
import { entriesFor } from "@/lib/plan";
import { buildShoppingList } from "@/lib/shopping";
import ui from "../ui.module.css";
import { isPicked, readDrop, type Picked } from "./picking";
import styles from "./PlanBoard.module.css";
import { PlanEntryCard } from "./PlanEntryCard";
import { PlanSlot } from "./PlanSlot";
import { RecipeShelf } from "./RecipeShelf";

/** The weekly planner: a recipe shelf beside seven days of breakfast, lunch, dinner, and snack slots. */
export function PlanBoard({ recipes }: { recipes: RecipeSummary[] }) {
  const { plan, add, move, setServings, remove, clear } = usePlan();
  const { pantry } = useMyPantry();
  const d = useDict();
  const t = d.plan;
  const lang = useLang();
  const [picked, setPicked] = useState<Picked | null>(null);

  const bySlug = useMemo(() => new Map(recipes.map((r) => [r.slug, r])), [recipes]);
  // Ignore entries for recipes that no longer exist.
  const entries = plan.entries.filter((e) => bySlug.has(e.slug));
  const weekTotal = useMemo(
    () => buildShoppingList(entries, bySlug, pantry, lang).total,
    [entries, bySlug, pantry, lang],
  );
  const slotName = (day: number, meal: Meal) => `${t.days[day]} (${d.meals[meal].toLowerCase()})`;

  /** Adds a shelf recipe to the slot, or moves a planned meal there. */
  const place = (p: Picked, day: number, meal: Meal) => {
    if (p.kind === "recipe") {
      const recipe = bySlug.get(p.slug);
      if (recipe) add(p.slug, day, meal, recipe.serves);
    } else if (plan.entries.some((e) => e.id === p.id)) {
      move(p.id, day, meal);
    }
    setPicked(null);
  };

  return (
    <div className={styles.board}>
      <RecipeShelf recipes={recipes} bySlug={bySlug} picked={picked} onPick={setPicked} />

      <div className={styles.week}>
        <div className={`${styles.summary} no-print`}>
          <p>
            <strong className="hand">{entries.length}</strong> {t.planned(entries.length)}
            {entries.length > 0 && t.toBuy(formatUsd(weekTotal))}
          </p>
          <div className={styles.summaryActions}>
            <Link href={localePath(lang, "/plan/shopping")} className={`${ui.button} ${ui.primary}`}>
              {t.shopping}
            </Link>
            {entries.length > 0 && (
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => window.confirm(t.confirmClear) && clear()}
              >
                {t.clear}
              </button>
            )}
          </div>
        </div>

        {picked && (
          <p className={styles.picking} role="status">
            {t.picking}{" "}
            <button type="button" className={styles.linkBtn} onClick={() => setPicked(null)}>
              {t.cancel}
            </button>
          </p>
        )}

        <ol className={styles.days}>
          {t.days.map((dayName, day) => (
            <li key={dayName} className={styles.day}>
              <h3>{dayName}</h3>
              <div className={styles.slots}>
                {MEALS.map((meal) => (
                  <PlanSlot
                    key={meal}
                    title={d.meals[meal]}
                    slotName={slotName(day, meal)}
                    placing={picked !== null}
                    onPlace={() => picked && place(picked, day, meal)}
                    onDrop={(e) => {
                      const dropped = readDrop(e);
                      if (dropped) place(dropped, day, meal);
                    }}
                  >
                    {entriesFor({ ...plan, entries }, day, meal).map((entry) => (
                      <PlanEntryCard
                        key={entry.id}
                        entry={entry}
                        recipe={bySlug.get(entry.slug)!}
                        slotName={slotName(day, meal)}
                        picked={isPicked(picked, { kind: "entry", id: entry.id })}
                        onPick={setPicked}
                        onServings={(n) => setServings(entry.id, n)}
                        onRemove={() => remove(entry.id)}
                      />
                    ))}
                  </PlanSlot>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
