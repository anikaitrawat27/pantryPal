"use client";

import { useMemo, useState } from "react";
import { useFavorites } from "@/client/favorites";
import type { Course, Meal } from "@/data/schema";
import { useDict } from "@/i18n/client";
import type { RecipeSummary } from "@/lib/catalog";
import { normalize } from "@/lib/match";
import { formatUsd } from "@/lib/nutrition";
import { CourseDoodle } from "../Doodle";
import ui from "../ui.module.css";
import { draggable, isPicked, type Picked } from "./picking";
import styles from "./PlanBoard.module.css";

const SHELF_LIMIT = 40;

/** Which meal a course usually belongs to, shown as a hint under each recipe. */
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

interface Props {
  recipes: RecipeSummary[];
  bySlug: Map<string, RecipeSummary>;
  picked: Picked | null;
  onPick: (picked: Picked | null) => void;
}

/** The searchable list of recipes to drag (or tap) onto the week. */
export function RecipeShelf({ recipes, bySlug, picked, onPick }: Props) {
  const d = useDict();
  const t = d.plan;
  const { favorites } = useFavorites();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "favorites">("all");

  const shown = useMemo(() => {
    const q = normalize(query);
    const pool = tab === "favorites" ? favorites.flatMap((slug) => bySlug.get(slug) ?? []) : recipes;
    return pool.filter((r) => !q || normalize(r.title).includes(q)).slice(0, SHELF_LIMIT);
  }, [query, tab, favorites, bySlug, recipes]);

  return (
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
        {shown.length === 0 && <li className={styles.hint}>{tab === "favorites" ? t.noFavorites : t.noMatches}</li>}
        {shown.map((r) => {
          const target: Picked = { kind: "recipe", slug: r.slug };
          const selected = isPicked(picked, target);
          return (
            <li key={r.slug} {...draggable(target)} className={styles.shelfItem} data-picked={selected}>
              <button type="button" aria-pressed={selected} onClick={() => onPick(selected ? null : target)}>
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
  );
}
