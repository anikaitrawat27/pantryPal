"use client";

import { useState } from "react";
import { getIngredient } from "@/data/pantry";
import type { RecipeIngredient, Substitution } from "@/data/schema";
import { useDict, useLang } from "@/i18n/client";
import { ingredientName, subNote } from "@/i18n/ingredients";
import styles from "./RecipeBody.module.css";

interface Props {
  /** The line as shown, already scaled and with any swap applied, e.g. "1 1/2 cups milk". */
  line: string;
  /** The ingredient as currently used (the swap target when swapped). */
  ingredient: RecipeIngredient;
  /** The recipe's original ingredient id, stable across swaps. */
  originalId: string;
  note?: string;
  swapOptions: readonly Substitution[];
  swapped: boolean;
  inPantry: boolean;
  checked: boolean;
  onToggleChecked: () => void;
  onSwap: (option: Substitution) => void;
  onUndoSwap: () => void;
}

/** One ingredient: a checkbox, its scaled line and labels, and a menu of swaps. */
export function IngredientRow(props: Props) {
  const { line, ingredient, originalId, note, swapOptions, swapped, inPantry, checked } = props;
  const t = useDict().recipe;
  const lang = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = `swap-${originalId}`;

  return (
    <li className={styles.ingItem} data-checked={checked}>
      <label className={styles.check}>
        <input type="checkbox" checked={checked} onChange={props.onToggleChecked} />
        <span>
          <span className={styles.line} data-testid={`ing-${originalId}`}>
            {line}
          </span>
          {note && <span className={styles.note}> ({note})</span>}
          {ingredient.optional && <span className={styles.optional}>{t.optional}</span>}
          {getIngredient(ingredient.id).tier === "extra" && <span className={styles.extra}>{t.extra}</span>}
          {inPantry && <span className={styles.have}>{t.inPantry}</span>}
        </span>
      </label>

      {(swapOptions.length > 0 || swapped) && (
        <div className={`${styles.swap} no-print`}>
          {swapped ? (
            <button type="button" className={styles.swapBtn} onClick={props.onUndoSwap}>
              {t.undoSwap}
            </button>
          ) : (
            <button
              type="button"
              className={styles.swapBtn}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {t.swap}
            </button>
          )}
          {menuOpen && !swapped && (
            <ul
              id={menuId}
              className={styles.swapMenu}
              onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
              aria-label={t.swapsFor(ingredientName(originalId, lang))}
            >
              {swapOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      props.onSwap(option);
                      setMenuOpen(false);
                    }}
                  >
                    {t.use(ingredientName(option.id, lang))}
                    {option.note && <span className={styles.subNote}>{subNote(option.note, lang)}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
