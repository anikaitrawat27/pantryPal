"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { serializeFilters, EMPTY_FILTERS } from "@/lib/filter";
import { IngredientInput } from "./IngredientInput";
import styles from "./PantrySearch.module.css";
import ui from "./ui.module.css";

/** Home page entry point: pick ingredients, then see what can be made with only those. */
export function PantrySearch() {
  const router = useRouter();
  const [have, setHave] = useState<string[]>([]);

  const go = () => {
    const qs = serializeFilters({ ...EMPTY_FILTERS, have, haveMode: "only" }).toString();
    router.push(`/recipes${qs ? `?${qs}` : ""}`);
  };

  return (
    <form
      className={`${ui.card} ${styles.form}`}
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <IngredientInput label="What's in your pantry?" value={have} onChange={setHave} placeholder="Try: rice, eggs, peas" />
      <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={have.length === 0}>
        Show me what I can make
      </button>
    </form>
  );
}
