"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MEALS, type Course, type Meal } from "@/data/schema";
import type { RecipeSummary } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { MEAL_LABELS } from "@/lib/labels";
import { normalize } from "@/lib/match";
import { useMyPantry } from "@/lib/my-pantry";
import { formatUsd } from "@/lib/nutrition";
import { DAYS, entriesFor } from "@/lib/plan";
import { usePlan } from "@/lib/plan-store";
import { buildShoppingList } from "@/lib/shopping";
import { CourseDoodle } from "./Doodle";
import styles from "./PlanBoard.module.css";
import ui from "./ui.module.css";

type Picked = { kind: "recipe"; slug: string } | { kind: "entry"; id: string };

const DRAG_TYPE = "application/x-pantrypal";
const SHELF_LIMIT = 40;

/** Which meal slot a course most likely belongs in, for the shelf hint. */
const COURSE_MEAL: Record<Course, Meal> = {
  breakfast: "breakfast",
  main: "dinner",
  soup: "lunch",
  salad: "lunch",
  appetizer: "snack",
  side: "dinner",
  drink: "snack",
  dessert: "snack",
};

export function PlanBoard({ recipes }: { recipes: RecipeSummary[] }) {
  const { plan, add, move, setServings, remove, clear } = usePlan();
  const { favorites } = useFavorites();
  const { pantry } = useMyPantry();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"favorites" | "all">("all");

  const bySlug = useMemo(() => new Map(recipes.map((r) => [r.slug, r])), [recipes]);
  const entries = plan.entries.filter((e) => bySlug.has(e.slug));

  const shelf = useMemo(() => {
    const q = normalize(query);
    const pool = tab === "favorites" ? favorites.map((s) => bySlug.get(s)).filter((r): r is RecipeSummary => Boolean(r)) : recipes;
    return pool.filter((r) => !q || normalize(r.title).includes(q)).slice(0, SHELF_LIMIT);
  }, [query, tab, favorites, bySlug, recipes]);

  const week = useMemo(() => buildShoppingList(entries, bySlug, pantry), [entries, bySlug, pantry]);

  const place = (p: Picked, day: number, meal: Meal) => {
    if (p.kind === "recipe") add(p.slug, day, meal, bySlug.get(p.slug)!.serves);
    else move(p.id, day, meal);
    setPicked(null);
  };

  const onDrop = (e: React.DragEvent, day: number, meal: Meal) => {
    e.preventDefault();
    try {
      const p = JSON.parse(e.dataTransfer.getData(DRAG_TYPE)) as Picked;
      if ((p.kind === "recipe" && bySlug.has(p.slug)) || (p.kind === "entry" && plan.entries.some((x) => x.id === p.id))) place(p, day, meal);
    } catch {
      // Not one of our drags.
    }
  };

  const dragProps = (p: Picked) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(p));
      e.dataTransfer.effectAllowed = "copyMove";
    },
  });

  return (
    <div className={styles.board}>
      <aside className={`${ui.card} ${styles.shelf}`} aria-label="Recipe shelf">
        <h2>Recipe shelf</h2>
        <p className={styles.hint}>Drag a recipe onto a day, or tap it and then tap a slot.</p>
        <div className={styles.tabs} role="group" aria-label="Which recipes">
          {(["all", "favorites"] as const).map((t) => (
            <button key={t} type="button" className={ui.chip} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t === "all" ? "All recipes" : `Favorites (${favorites.length})`}
            </button>
          ))}
        </div>
        <label className={styles.search}>
          <span className="sr-only">Search recipes</span>
          <input type="search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <ul className={styles.shelfList}>
          {shelf.length === 0 && <li className={styles.hint}>{tab === "favorites" ? "No favorites yet." : "No matches."}</li>}
          {shelf.map((r) => {
            const isPicked = picked?.kind === "recipe" && picked.slug === r.slug;
            return (
              <li key={r.slug} {...dragProps({ kind: "recipe", slug: r.slug })} className={styles.shelfItem} data-picked={isPicked}>
                <button type="button" aria-pressed={isPicked} onClick={() => setPicked(isPicked ? null : { kind: "recipe", slug: r.slug })}>
                  <CourseDoodle course={r.course} size={30} />
                  <span>
                    {r.title}
                    <small>
                      {MEAL_LABELS[COURSE_MEAL[r.course]]} · {formatUsd(r.cost)}
                    </small>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className={styles.week}>
        <div className={`${styles.summary} no-print`}>
          <p>
            <strong className="hand">{entries.length}</strong> {entries.length === 1 ? "meal" : "meals"} planned
            {entries.length > 0 && <> · about {formatUsd(week.total)} to buy</>}
          </p>
          <div className={styles.summaryActions}>
            <Link href="/plan/shopping" className={`${ui.button} ${ui.primary}`}>
              Shopping list
            </Link>
            {entries.length > 0 && (
              <button type="button" className={styles.linkBtn} onClick={() => window.confirm("Clear the whole week?") && clear()}>
                Clear week
              </button>
            )}
          </div>
        </div>

        {picked && (
          <p className={styles.picking} role="status">
            Tap &quot;Place here&quot; on a slot.{" "}
            <button type="button" className={styles.linkBtn} onClick={() => setPicked(null)}>
              Cancel
            </button>
          </p>
        )}

        <ol className={styles.days}>
          {DAYS.map((day, d) => (
            <li key={day} className={styles.day}>
              <h3>{day}</h3>
              <div className={styles.slots}>
                {MEALS.map((meal) => {
                  const here = entriesFor({ ...plan, entries }, d, meal);
                  return (
                    <section
                      key={meal}
                      className={styles.slot}
                      aria-label={`${day} ${MEAL_LABELS[meal]}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.dataset.over = "true";
                      }}
                      onDragLeave={(e) => delete e.currentTarget.dataset.over}
                      onDrop={(e) => {
                        delete e.currentTarget.dataset.over;
                        onDrop(e, d, meal);
                      }}
                    >
                      <h4>{MEAL_LABELS[meal]}</h4>
                      <ul>
                        {here.map((entry) => {
                          const r = bySlug.get(entry.slug)!;
                          const isPicked = picked?.kind === "entry" && picked.id === entry.id;
                          return (
                            <li key={entry.id} className={styles.entry} data-picked={isPicked} {...dragProps({ kind: "entry", id: entry.id })}>
                              <Link href={`/recipes/${r.slug}`} className={styles.entryTitle}>
                                {r.title}
                              </Link>
                              <div className={styles.entryControls}>
                                <button
                                  type="button"
                                  onClick={() => setServings(entry.id, entry.servings - 1)}
                                  disabled={entry.servings <= 1}
                                  aria-label={`Fewer servings of ${r.title}`}
                                >
                                  −
                                </button>
                                <span aria-label={`${entry.servings} servings`}>{entry.servings}</span>
                                <button
                                  type="button"
                                  onClick={() => setServings(entry.id, entry.servings + 1)}
                                  disabled={entry.servings >= 6}
                                  aria-label={`More servings of ${r.title}`}
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  className={styles.move}
                                  aria-pressed={isPicked}
                                  onClick={() => setPicked(isPicked ? null : { kind: "entry", id: entry.id })}
                                  aria-label={`Move ${r.title}`}
                                >
                                  move
                                </button>
                                <button type="button" onClick={() => remove(entry.id)} aria-label={`Remove ${r.title} from ${day} ${MEAL_LABELS[meal]}`}>
                                  ×
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      {picked && (
                        <button
                          type="button"
                          className={styles.place}
                          onClick={() => place(picked, d, meal)}
                          aria-label={`Place in ${day} ${MEAL_LABELS[meal].toLowerCase()}`}
                        >
                          Place here
                        </button>
                      )}
                    </section>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
