"use client";

import Link from "next/link";
import { GROUP_LABELS, INGREDIENTS, type IngredientGroup } from "@/data/pantry";
import { serializeFilters, EMPTY_FILTERS } from "@/lib/filter";
import { useMyPantry } from "@/lib/my-pantry";
import styles from "@/app/pantry/page.module.css";
import ui from "./ui.module.css";

const GROUP_ORDER: IngredientGroup[] = ["produce", "dairy-eggs", "protein", "grains", "canned", "baking", "condiments", "extras"];

/** The full ingredient list. Tapping an item adds it to or removes it from the cook's saved pantry. */
export function PantryShelves({ usage }: { usage: Record<string, number> }) {
  const { pantry, toggle, markLow, clear } = useMyPantry();
  const cookHref = `/recipes?${serializeFilters({ ...EMPTY_FILTERS, have: [...pantry.have], haveMode: "only" })}`;

  return (
    <>
      <div className={`${ui.card} ${styles.summary}`}>
        {pantry.have.length === 0 ? (
          <p>Tap the ingredients you have at home. Pantry Pal remembers them on this device and shows what you can make.</p>
        ) : (
          <>
            <p>
              <strong className="hand">{pantry.have.length}</strong> items saved
              {pantry.low.length > 0 && <>, {pantry.low.length} running low</>}.
            </p>
            <div className={styles.summaryActions}>
              <Link href={cookHref} className={`${ui.button} ${ui.primary}`}>
                What can I make?
              </Link>
              <button type="button" className={styles.clearBtn} onClick={() => window.confirm("Clear your saved pantry?") && clear()}>
                Clear all
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.shelves}>
        {GROUP_ORDER.map((g) => (
          <section key={g} className={`${styles.shelf} ${g === "extras" ? styles.extras : ""}`} aria-labelledby={`shelf-${g}`}>
            <h2 id={`shelf-${g}`}>{GROUP_LABELS[g]}</h2>
            <ul>
              {INGREDIENTS.filter((i) => i.group === g).map((i) => {
                const have = pantry.have.includes(i.id);
                const low = pantry.low.includes(i.id);
                return (
                  <li key={i.id} className={styles.item} data-have={have} data-low={low}>
                    <button type="button" aria-pressed={have} className={styles.toggle} onClick={() => toggle(i.id)}>
                      <span className={styles.box} aria-hidden="true" />
                      {i.name}
                    </button>
                    {have && (
                      <button
                        type="button"
                        className={styles.lowBtn}
                        aria-pressed={low}
                        onClick={() => markLow([i.id], !low)}
                        aria-label={`${i.name} running low`}
                        title="Running low"
                      >
                        low
                      </button>
                    )}
                    <Link href={`/recipes?have=${i.id}`} className={styles.count} aria-label={`${usage[i.id]} recipes use ${i.name}`}>
                      {usage[i.id]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
