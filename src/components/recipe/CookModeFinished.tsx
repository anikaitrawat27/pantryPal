"use client";

import { useState } from "react";
import { useMyPantry } from "@/client/my-pantry";
import { useDict, useLang } from "@/i18n/client";
import { ingredientName } from "@/i18n/ingredients";
import { related } from "@/lib/match";
import { toggled } from "@/lib/sets";
import styles from "./CookMode.module.css";

/** Cook mode's last screen: lets the cook mark pantry items that are now running low. */
export function CookModeFinished({
  ingredientIds,
  onClose,
}: {
  ingredientIds: readonly string[];
  onClose: () => void;
}) {
  const t = useDict().cook;
  const lang = useLang();
  const { pantry, markLow } = useMyPantry();
  const [low, setLow] = useState<ReadonlySet<string>>(new Set());
  const [saved, setSaved] = useState(false);

  // The saved-pantry items this recipe used (a recipe's "cheddar" matches a saved "cheese").
  const used = [...new Set(ingredientIds.flatMap((id) => pantry.have.filter((h) => related(id, h))))];

  return (
    <div className={styles.finished}>
      <p className={styles.step}>{t.done}</p>
      {used.length > 0 && !saved && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            markLow([...low], true);
            setSaved(true);
          }}
        >
          <fieldset>
            <legend>{t.lowQuestion}</legend>
            {used.map((id) => (
              <label key={id}>
                <input type="checkbox" checked={low.has(id)} onChange={() => setLow((prev) => toggled(prev, id))} />
                {ingredientName(id, lang)}
              </label>
            ))}
          </fieldset>
          <button type="submit" className={styles.startTimer} disabled={low.size === 0}>
            {t.lowSubmit}
          </button>
        </form>
      )}
      {saved && <p role="status">{t.lowSaved}</p>}
      <button type="button" className={styles.next} onClick={onClose}>
        {t.backToRecipe}
      </button>
    </div>
  );
}
