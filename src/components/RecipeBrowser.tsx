"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { RecipeSummary } from "@/lib/catalog";
import {
  activeFilterCount,
  filterRecipes,
  parseFilters,
  serializeFilters,
  SORTS,
  type FilterState,
  type Sort,
} from "@/lib/filter";
import styles from "./RecipeBrowser.module.css";
import { FilterPanel } from "./FilterPanel";
import { IngredientInput } from "./IngredientInput";
import { useMyPantry } from "@/lib/my-pantry";
import { useDict, useLang } from "@/i18n/client";
import { RecipeCard } from "./RecipeCard";
import ui from "./ui.module.css";

const PAGE_SIZE = 24;

export function RecipeBrowser({ recipes }: { recipes: RecipeSummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(params.toString())), [params]);

  const [q, setQ] = useState(filters.q);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [panelOpen, setPanelOpen] = useState(false);
  const { pantry } = useMyPantry();
  const lang = useLang();
  const d = useDict();
  const t = d.browse;

  const update = (patch: Partial<FilterState>) => {
    const qs = serializeFilters({ ...filters, ...patch }).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setShown(PAGE_SIZE);
  };

  // Follow the URL when it changes from outside the text box (back button, "Clear all").
  useEffect(() => setQ(filters.q), [filters.q]);

  // Keep the text box responsive and write it to the URL after a short pause.
  useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => {
      const qs = serializeFilters({ ...filters, q }).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      setShown(PAGE_SIZE);
    }, 250);
    return () => clearTimeout(t);
  }, [q, filters, pathname, router]);

  const results = useMemo(() => filterRecipes(recipes, filters), [recipes, filters]);
  const activeCount = activeFilterCount(filters);
  const anything = activeCount > 0 || filters.q || filters.have.length > 0;

  return (
    <div className={styles.layout}>
      {panelOpen && <div className={styles.backdrop} onClick={() => setPanelOpen(false)} aria-hidden="true" />}
      <aside
        onKeyDown={(e) => e.key === "Escape" && setPanelOpen(false)}
        className={`${styles.sidebar} ${panelOpen ? styles.open : ""}`}
        aria-label={t.filters}
        id="filters"
      >
        <div className={styles.sidebarHead}>
          <h2>{t.filters}</h2>
          <button type="button" className={styles.close} onClick={() => setPanelOpen(false)}>
            {t.done}
          </button>
        </div>
        <FilterPanel filters={filters} onChange={update} />
      </aside>

      <div className={styles.results}>
        <div className={`${ui.card} ${styles.search}`}>
          <IngredientInput
            label={d.search.label}
            value={filters.have}
            onChange={(have) => update({ have })}
            placeholder={d.search.placeholderBrowse}
          />
          {pantry.have.length > 0 && (
            <button
              type="button"
              className={styles.usePantry}
              onClick={() => update({ have: [...pantry.have], haveMode: "only" })}
            >
              {t.usePantry(pantry.have.length)}
            </button>
          )}
          <div className={styles.mode} role="radiogroup" aria-label={t.modeLabel}>
            {(
              [
                ["includes", t.modeIncludes],
                ["only", t.modeOnly],
              ] as const
            ).map(([mode, label]) => (
              <label key={mode} className={styles.modeOption}>
                <input
                  type="radio"
                  name="have-mode"
                  checked={filters.haveMode === mode}
                  onChange={() => update({ haveMode: mode })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {filters.haveMode === "only" && <p className={styles.hint}>{t.onlyHint}</p>}
          <label className={styles.textSearch}>
            <span className="sr-only">{t.searchName}</span>
            <input type="search" placeholder={t.searchPlaceholder} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>

        <div className={styles.bar}>
          <p className={styles.count} aria-live="polite" data-testid="result-count">
            {t.count(results.length)}
          </p>
          <div className={styles.barActions}>
            <label className={styles.sort}>
              <span>{t.sort}</span>
              <select value={filters.sort} onChange={(e) => update({ sort: e.target.value as Sort })}>
                {SORTS.map((s) => (
                  <option key={s} value={s}>
                    {d.sorts[s]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={`${ui.button} ${styles.filterBtn}`}
              onClick={() => setPanelOpen(true)}
              aria-controls="filters"
              aria-expanded={panelOpen}
            >
              {t.filters}
              {activeCount ? ` (${activeCount})` : ""}
            </button>
            {anything && (
              <button
                type="button"
                className={styles.clear}
                onClick={() => {
                  setQ("");
                  router.replace(pathname, { scroll: false });
                }}
              >
                {t.clear}
              </button>
            )}
          </div>
        </div>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <p className="hand">{t.emptyTitle}</p>
            <p>{t.emptyBody}</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {results.slice(0, shown).map((r, i) => (
                <RecipeCard key={r.recipe.slug} recipe={r.recipe} lang={lang} match={r.match} index={i} />
              ))}
            </div>
            {shown < results.length && (
              <div className={styles.more}>
                <button type="button" className={ui.button} onClick={() => setShown((s) => s + PAGE_SIZE)}>
                  {t.more(results.length - shown)}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
