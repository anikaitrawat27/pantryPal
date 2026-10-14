"use client";

import { useState, type KeyboardEvent } from "react";
import { useDict } from "@/i18n/client";
import ui from "../ui.module.css";
import styles from "./chat.module.css";

/** The message box. Enter sends; Shift+Enter adds a line. */
export function Composer({ busy, onSend }: { busy: boolean; onSend: (text: string) => void }) {
  const t = useDict().chat;
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim() || busy) return;
    onSend(draft);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <label className="sr-only" htmlFor="chat-input">
        {t.label}
      </label>
      <textarea
        id="chat-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t.placeholder}
        rows={2}
        maxLength={2000}
      />
      <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={busy || !draft.trim()}>
        {busy ? t.sending : t.send}
      </button>
    </form>
  );
}
