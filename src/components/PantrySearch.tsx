"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { EMPTY_FILTERS, serializeFilters } from "@/lib/filter";
import { useMyPantry } from "@/client/my-pantry";
import { IngredientInput } from "./IngredientInput";
import styles from "./PantrySearch.module.css";
import ui from "./ui.module.css";

/** Home page entry point: pick ingredients, then see what can be made with only those. */
export function PantrySearch() {
  const router = useRouter();
  const t = useDict().search;
  const lang = useLang();
  const [have, setHave] = useState<string[]>([]);
  const { pantry } = useMyPantry();

  const go = () => {
    const qs = serializeFilters({ ...EMPTY_FILTERS, have, haveMode: "only" }).toString();
    router.push(`${localePath(lang, "/recipes")}${qs ? `?${qs}` : ""}`);
  };

  return (
    <form
      className={`${ui.card} ${styles.form}`}
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <IngredientInput label={t.label} value={have} onChange={setHave} placeholder={t.placeholder} />
      <div className={styles.actions}>
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={have.length === 0}>
          {t.submit}
        </button>
        {pantry.have.length > 0 && (
          <button
            type="button"
            className={styles.saved}
            onClick={() => setHave([...new Set([...have, ...pantry.have])])}
          >
            {t.addSaved(pantry.have.length)}
          </button>
        )}
      </div>
    </form>
  );
}
