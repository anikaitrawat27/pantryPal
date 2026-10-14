"use client";

import type { ReactNode } from "react";
import { useDict } from "@/i18n/client";
import styles from "./PlanBoard.module.css";

interface Props {
  title: string;
  /** e.g. "Monday (dinner)". */
  slotName: string;
  /** True while something is picked up, so the slot offers "Place here". */
  placing: boolean;
  onPlace: () => void;
  onDrop: (e: React.DragEvent) => void;
  children: ReactNode;
}

/** One meal of one day: a drop target holding the planned meals. */
export function PlanSlot({ title, slotName, placing, onPlace, onDrop, children }: Props) {
  const t = useDict().plan;
  return (
    <section
      className={styles.slot}
      aria-label={slotName}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.dataset.over = "true";
      }}
      onDragLeave={(e) => delete e.currentTarget.dataset.over}
      onDrop={(e) => {
        e.preventDefault();
        delete e.currentTarget.dataset.over;
        onDrop(e);
      }}
    >
      <h4>{title}</h4>
      <ul>{children}</ul>
      {placing && (
        <button type="button" className={styles.place} onClick={onPlace} aria-label={t.placeIn(slotName)}>
          {t.place}
        </button>
      )}
    </section>
  );
}
