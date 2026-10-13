"use client";

import styles from "./ServingsStepper.module.css";

export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 6;

export function ServingsStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className={styles.stepper} role="group" aria-label="Servings">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= MIN_SERVINGS} aria-label="Fewer servings">
        −
      </button>
      <output aria-live="polite" className={styles.value} data-testid="servings">
        {value} <span>{value === 1 ? "serving" : "servings"}</span>
      </output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_SERVINGS} aria-label="More servings">
        +
      </button>
    </div>
  );
}
