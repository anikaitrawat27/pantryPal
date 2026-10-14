"use client";

import Link from "next/link";
import { useState } from "react";
import { setRecipeSaved } from "@/client/chat";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { formatUsd } from "@/lib/nutrition";
import type { UiEvent } from "@/server/chat/tools";
import ui from "../ui.module.css";
import styles from "./chat.module.css";

type Generated = Extract<UiEvent, { type: "generated" }>;

/** A recipe the helper just wrote and validated, with Open and Save buttons. */
export function GeneratedRecipeCard({ event }: { event: Generated }) {
  const d = useDict();
  const t = d.chat;
  const lang = useLang();
  const [saved, setSaved] = useState(false);
  const { recipe, es, costPerServingUsd, nutrition } = event.recipe;
  const text = lang === "es" && es ? es : recipe;

  const toggleSaved = async () => {
    const next = !saved;
    setSaved(next);
    try {
      await setRecipeSaved(event.id, next);
    } catch {
      setSaved(!next);
    }
  };

  return (
    <article className={`${ui.card} ${styles.generated}`}>
      <p className={styles.badge}>{t.newRecipe}</p>
      <h3>{text.title}</h3>
      <p>{text.blurb}</p>
      <p className={styles.meta}>
        {d.units.minutes(recipe.prep + recipe.cook)} · {recipe.serves} {d.recipe.servingsN(recipe.serves)} ·{" "}
        {formatUsd(costPerServingUsd)} · {nutrition.kcal} {d.recipe.calories.toLowerCase()}
      </p>
      <p className={styles.checked}>✓ {t.checked}</p>
      <div className={styles.row}>
        <Link href={`${localePath(lang, "/my-recipes")}?id=${event.id}`} className={ui.button}>
          {t.open}
        </Link>
        <button
          type="button"
          className={`${ui.button} ${saved ? "" : ui.primary}`}
          aria-pressed={saved}
          onClick={toggleSaved}
        >
          {saved ? t.saved : t.save}
        </button>
      </div>
    </article>
  );
}
