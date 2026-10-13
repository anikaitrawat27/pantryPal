"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MEALS, type Course, type Meal } from "@/data/schema";
import type { RecipeSummary } from "@/lib/catalog";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { useFavorites } from "@/lib/favorites";
import { normalize } from "@/lib/match";
import { useMyPantry } from "@/lib/my-pantry";
import { formatUsd } from "@/lib/nutrition";
import { entriesFor } from "@/lib/plan";
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
  const lang = useLang();
  const d = useDict();
  const t = d.plan;
  const slotName = (day: number, meal: Meal) => `${t.days[day]} (${d.meals[meal].toLowerCase()})`;
  const { favorites } = useFavorites();
  const { pantry } = useMyPantry();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"favorites" | "all">("all");

  const bySlug = useMemo(() => new Map(recipes.map((r) => [r.slug, r])), [recipes]);
  const entries = plan.entries.filter((e) => bySlug.has(e.slug));

  const shelf = useMemo(() => {
    const q = normalize(query);
    const pool =
      tab === "favorites" ? favorites.map((s) => bySlug.get(s)).filter((r): r is RecipeSummary => Boolean(r)) : recipes;
    return pool.filter((r) => !q || normalize(r.title).includes(q)).slice(0, SHELF_LIMIT);
  }, [query, tab, favorites, bySlug, recipes]);

  const week = useMemo(() => buildShoppingList(entries, bySlug, pantry, lang), [entries, bySlug, pantry, lang]);

  const place = (p: Picked, day: number, meal: Meal) => {
    if (p.kind === "recipe") add(p.slug, day, meal, bySlug.get(p.slug)!.serves);
    else move(p.id, day, meal);
    setPicked(null);
  };

  const onDrop = (e: React.DragEvent, day: number, meal: Meal) => {
    e.preventDefault();
    try {
      const p = JSON.parse(e.dataTransfer.getData(DRAG_TYPE)) as Picked;
      if (
        (p.kind === "recipe" && bySlug.has(p.slug)) ||
        (p.kind === "entry" && plan.entries.some((x) => x.id === p.id))
      )
        place(p, day, meal);
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
      <aside className={`${ui.card} ${styles.shelf}`} aria-label={t.shelf}>
        <h2>{t.shelf}</h2>
        <p className={styles.hint}>{t.shelfHint}</p>
        <div className={styles.tabs} role="group" aria-label={t.which}>
          {(["all", "favorites"] as const).map((which) => (
            <button
              key={which}
              type="button"
              className={ui.chip}
              aria-pressed={tab === which}
              onClick={() => setTab(which)}
            >
              {which === "all" ? t.all : t.favorites(favorites.length)}
            </button>
          ))}
        </div>
        <label className={styles.search}>
          <span className="sr-only">{t.search}</span>
          <input
            type="search"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <ul className={styles.shelfList}>
          {shelf.length === 0 && <li className={styles.hint}>{tab === "favorites" ? t.noFavorites : t.noMatches}</li>}
          {shelf.map((r) => {
            const isPicked = picked?.kind === "recipe" && picked.slug === r.slug;
            return (
              <li
                key={r.slug}
                {...dragProps({ kind: "recipe", slug: r.slug })}
                className={styles.shelfItem}
                data-picked={isPicked}
              >
                <button
                  type="button"
                  aria-pressed={isPicked}
                  onClick={() => setPicked(isPicked ? null : { kind: "recipe", slug: r.slug })}
                >
                  <CourseDoodle course={r.course} size={30} />
                  <span>
                    {r.title}
                    <small>
                      {d.meals[COURSE_MEAL[r.course]]} · {formatUsd(r.cost)}
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
            <strong className="hand">{entries.length}</strong> {t.planned(entries.length)}
            {entries.length > 0 && t.toBuy(formatUsd(week.total))}
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
          {t.days.map((day, dayIndex) => (
            <li key={day} className={styles.day}>
              <h3>{day}</h3>
              <div className={styles.slots}>
                {MEALS.map((meal) => {
                  const here = entriesFor({ ...plan, entries }, dayIndex, meal);
                  return (
                    <section
                      key={meal}
                      className={styles.slot}
                      aria-label={slotName(dayIndex, meal)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.dataset.over = "true";
                      }}
                      onDragLeave={(e) => delete e.currentTarget.dataset.over}
                      onDrop={(e) => {
                        delete e.currentTarget.dataset.over;
                        onDrop(e, dayIndex, meal);
                      }}
                    >
                      <h4>{d.meals[meal]}</h4>
                      <ul>
                        {here.map((entry) => {
                          const r = bySlug.get(entry.slug)!;
                          const isPicked = picked?.kind === "entry" && picked.id === entry.id;
                          return (
                            <li
                              key={entry.id}
                              className={styles.entry}
                              data-picked={isPicked}
                              {...dragProps({ kind: "entry", id: entry.id })}
                            >
                              <Link href={localePath(lang, `/recipes/${r.slug}`)} className={styles.entryTitle}>
                                {r.title}
                              </Link>
                              <div className={styles.entryControls}>
                                <button
                                  type="button"
                                  onClick={() => setServings(entry.id, entry.servings - 1)}
                                  disabled={entry.servings <= 1}
                                  aria-label={t.fewer(r.title)}
                                >
                                  −
                                </button>
                                <span aria-label={t.servingsN(entry.servings)}>{entry.servings}</span>
                                <button
                                  type="button"
                                  onClick={() => setServings(entry.id, entry.servings + 1)}
                                  disabled={entry.servings >= 6}
                                  aria-label={t.more(r.title)}
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  className={styles.move}
                                  aria-pressed={isPicked}
                                  onClick={() => setPicked(isPicked ? null : { kind: "entry", id: entry.id })}
                                  aria-label={t.moveLabel(r.title)}
                                >
                                  {t.move}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => remove(entry.id)}
                                  aria-label={t.remove(r.title, slotName(dayIndex, meal))}
                                >
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
                          onClick={() => place(picked, dayIndex, meal)}
                          aria-label={t.placeIn(slotName(dayIndex, meal))}
                        >
                          {t.place}
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
