"use client";

import { useDict } from "@/i18n/client";
import ui from "./ui.module.css";

export function PrintButton() {
  const t = useDict().recipe;
  return (
    <button type="button" className={ui.button} onClick={() => window.print()}>
      {t.print}
    </button>
  );
}
