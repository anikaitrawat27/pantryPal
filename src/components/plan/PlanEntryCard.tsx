"use client";

import Link from "next/link";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import type { RecipeSummary } from "@/lib/catalog";
import type { PlanEntry } from "@/lib/plan";
import { draggable, type Picked } from "./picking";
import styles from "./PlanBoard.module.css";

interface Props {
  entry: PlanEntry;
  recipe: RecipeSummary;
  /** e.g. "Monday (dinner)", for button labels. */
  slotName: string;
  picked: boolean;
  onPick: (picked: Picked | null) => void;
  onServings: (servings: number) => void;
  onRemove: () => void;
}

/** One planned meal: its title, a servings stepper, and move and remove buttons. */
export function PlanEntryCard({ entry, recipe, slotName, picked, onPick, onServings, onRemove }: Props) {
  const t = useDict().plan;
  const lang = useLang();
  const self: Picked = { kind: "entry", id: entry.id };
  return (
    <li className={styles.entry} data-picked={picked} {...draggable(self)}>
      <Link href={localePath(lang, `/recipes/${recipe.slug}`)} className={styles.entryTitle}>
        {recipe.title}
      </Link>
      <div className={styles.entryControls}>
        <button
          type="button"
          onClick={() => onServings(entry.servings - 1)}
          disabled={entry.servings <= 1}
          aria-label={t.fewer(recipe.title)}
        >
          −
        </button>
        <span aria-label={t.servingsN(entry.servings)}>{entry.servings}</span>
        <button
          type="button"
          onClick={() => onServings(entry.servings + 1)}
          disabled={entry.servings >= 6}
          aria-label={t.more(recipe.title)}
        >
          +
        </button>
        <button
          type="button"
          className={styles.move}
          aria-pressed={picked}
          onClick={() => onPick(picked ? null : self)}
          aria-label={t.moveLabel(recipe.title)}
        >
          {t.move}
        </button>
        <button type="button" onClick={onRemove} aria-label={t.remove(recipe.title, slotName)}>
          ×
        </button>
      </div>
    </li>
  );
}
