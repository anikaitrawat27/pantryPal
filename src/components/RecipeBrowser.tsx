"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { RecipeSummary } from "@/lib/catalog";
import { activeFilterCount, filterRecipes, parseFilters, serializeFilters, type FilterState } from "@/lib/filter";
import styles from "./RecipeBrowser.module.css";
import { FilterPanel } from "./FilterPanel";
import { IngredientInput } from "./IngredientInput";
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
        className={`${styles.sidebar} ${panelOpen ? styles.open : ""}`} aria-label="Filters" id="filters">
        <div className={styles.sidebarHead}>
          <h2>Filters</h2>
          <button type="button" className={styles.close} onClick={() => setPanelOpen(false)}>
            Done
          </button>
        </div>
        <FilterPanel filters={filters} onChange={update} />
      </aside>

      <div className={styles.results}>
        <div className={`${ui.card} ${styles.search}`}>
          <IngredientInput
            label="What's in your pantry?"
            value={filters.have}
            onChange={(have) => update({ have })}
            placeholder="rice, eggs, peas…"
          />
          <div className={styles.mode} role="radiogroup" aria-label="How to match ingredients">
            {(
              [
                ["includes", "Recipes using all of these"],
                ["only", "What can I make with only these?"],
              ] as const
            ).map(([mode, label]) => (
              <label key={mode} className={styles.modeOption}>
                <input type="radio" name="have-mode" checked={filters.haveMode === mode} onChange={() => update({ haveMode: mode })} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {filters.haveMode === "only" && (
            <p className={styles.hint}>Salt, pepper, oil, and water are assumed. Recipes missing up to two items are shown, fewest first.</p>
          )}
          <label className={styles.textSearch}>
            <span className="sr-only">Search recipes by name</span>
            <input type="search" placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>

        <div className={styles.bar}>
          <p className={styles.count} aria-live="polite" data-testid="result-count">
            {results.length} {results.length === 1 ? "recipe" : "recipes"}
          </p>
          <div className={styles.barActions}>
            <button type="button" className={`${ui.button} ${styles.filterBtn}`} onClick={() => setPanelOpen(true)} aria-controls="filters" aria-expanded={panelOpen}>
              Filters{activeCount ? ` (${activeCount})` : ""}
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
                Clear all
              </button>
            )}
          </div>
        </div>

        {results.length === 0 ? (
          <div className={styles.empty}>
            <p className="hand">Nothing on this shelf yet.</p>
            <p>Try removing a filter or an ingredient.</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {results.slice(0, shown).map((r, i) => (
                <RecipeCard key={r.recipe.slug} recipe={r.recipe} match={r.match} index={i} />
              ))}
            </div>
            {shown < results.length && (
              <div className={styles.more}>
                <button type="button" className={ui.button} onClick={() => setShown((s) => s + PAGE_SIZE)}>
                  Show more ({results.length - shown} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

