"use client";

import { useState } from "react";
import { useDict } from "@/i18n/client";
import ui from "../ui.module.css";
import styles from "./auth.module.css";

/** Shows recovery codes once, with copy and download, and waits for the user to confirm they saved them. */
export function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const t = useDict().auth;
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");
  const download = () => {
    const url = URL.createObjectURL(new Blob([`Pantry Pal recovery codes\n\n${text}\n`], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "pantry-pal-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className={styles.codes}>
      <h2>{t.codesTitle}</h2>
      <p>{t.codesBody}</p>
      <ol className={styles.codeList} data-testid="recovery-codes">
        {codes.map((c) => (
          <li key={c}>
            <code>{c}</code>
          </li>
        ))}
      </ol>
      <div className={styles.row}>
        <button
          type="button"
          className={ui.button}
          onClick={() =>
            navigator.clipboard
              .writeText(text)
              .then(() => setCopied(true))
              .catch(() => setCopied(false))
          }
        >
          {copied ? "✓" : t.codesCopy}
        </button>
        <button type="button" className={ui.button} onClick={download}>
          {t.codesDownload}
        </button>
      </div>
      <label className={styles.check}>
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        {t.codesSaved}
      </label>
      <button type="button" className={`${ui.button} ${ui.primary}`} disabled={!saved} onClick={onDone}>
        {t.continue}
      </button>
    </div>
  );
}
