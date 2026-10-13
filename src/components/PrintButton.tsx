"use client";

import ui from "./ui.module.css";

export function PrintButton() {
  return (
    <button type="button" className={ui.button} onClick={() => window.print()}>
      Print
    </button>
  );
}
