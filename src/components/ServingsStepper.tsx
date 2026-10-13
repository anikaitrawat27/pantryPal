"use client";

import { useDict } from "@/i18n/client";
import styles from "./ServingsStepper.module.css";

export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 6;

export function ServingsStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const t = useDict().recipe;
  return (
    <div className={styles.stepper} role="group" aria-label={t.servings}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= MIN_SERVINGS} aria-label={t.fewer}>
        −
      </button>
      <output aria-live="polite" className={styles.value} data-testid="servings">
        {value} <span>{t.servingsN(value)}</span>
      </output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_SERVINGS} aria-label={t.moreServings}>
        +
      </button>
    </div>
  );
}
