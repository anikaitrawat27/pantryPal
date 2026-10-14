"use client";

import Link from "next/link";
import { INGREDIENTS, type IngredientGroup } from "@/data/pantry";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { ingredientName } from "@/i18n/ingredients";
import { EMPTY_FILTERS, serializeFilters } from "@/lib/filter";
import { useMyPantry } from "@/client/my-pantry";
import styles from "@/views/PantryView.module.css";
import ui from "../ui.module.css";

const GROUP_ORDER: IngredientGroup[] = [
  "produce",
  "dairy-eggs",
  "protein",
  "grains",
  "canned",
  "baking",
  "condiments",
  "extras",
];

/** The full ingredient list. Tapping an item adds it to or removes it from the cook's saved pantry. */
export function PantryShelves({ usage }: { usage: Record<string, number> }) {
  const { pantry, toggle, markLow, clear } = useMyPantry();
  const lang = useLang();
  const d = useDict();
  const t = d.pantry;
  const cookHref = `${localePath(lang, "/recipes")}?${serializeFilters({ ...EMPTY_FILTERS, have: [...pantry.have], haveMode: "only" })}`;

  return (
    <>
      <div className={`${ui.card} ${styles.summary}`}>
        {pantry.have.length === 0 ? (
          <p>{t.empty}</p>
        ) : (
          <>
            <p>
              {t.saved(pantry.have.length)}
              {pantry.low.length > 0 && t.lowCount(pantry.low.length)}.
            </p>
            <div className={styles.summaryActions}>
              <Link href={cookHref} className={`${ui.button} ${ui.primary}`}>
                {t.cook}
              </Link>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => window.confirm(t.confirmClear) && clear()}
              >
                {t.clear}
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.shelves}>
        {GROUP_ORDER.map((g) => (
          <section
            key={g}
            className={`${styles.shelf} ${g === "extras" ? styles.extras : ""}`}
            aria-labelledby={`shelf-${g}`}
          >
            <h2 id={`shelf-${g}`}>{d.groups[g]}</h2>
            <ul>
              {INGREDIENTS.filter((i) => i.group === g).map((i) => {
                const have = pantry.have.includes(i.id);
                const low = pantry.low.includes(i.id);
                const name = ingredientName(i.id, lang);
                return (
                  <li key={i.id} className={styles.item} data-have={have} data-low={low}>
                    <button type="button" aria-pressed={have} className={styles.toggle} onClick={() => toggle(i.id)}>
                      <span className={styles.box} aria-hidden="true" />
                      {name}
                    </button>
                    {have && (
                      <button
                        type="button"
                        className={styles.lowBtn}
                        aria-pressed={low}
                        onClick={() => markLow([i.id], !low)}
                        aria-label={t.lowLabel(name)}
                        title={t.lowTitle}
                      >
                        {t.low}
                      </button>
                    )}
                    <Link
                      href={`${localePath(lang, "/recipes")}?have=${i.id}`}
                      className={styles.count}
                      aria-label={t.usage(usage[i.id], name)}
                    >
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
