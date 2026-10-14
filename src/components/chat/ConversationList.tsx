"use client";

import Link from "next/link";
import type { ConversationRow } from "@/client/chat";
import { useDict } from "@/i18n/client";
import ui from "../ui.module.css";
import styles from "./chat.module.css";

interface Props {
  conversations: ConversationRow[];
  activeId: string | null;
  basePath: string;
  onNew: () => void;
  onOpen: () => void;
  onDelete: (id: string) => void;
}

/** The sidebar: a New chat button and the user's recent conversations. */
export function ConversationList({ conversations, activeId, basePath, onNew, onOpen, onDelete }: Props) {
  const t = useDict().chat;
  return (
    <aside className={styles.sidebar} aria-label={t.recent}>
      <button type="button" className={ui.button} onClick={onNew}>
        + {t.newChat}
      </button>
      <h2>{t.recent}</h2>
      {conversations.length === 0 ? (
        <p className={styles.muted}>{t.noChats}</p>
      ) : (
        <ul className={styles.convList}>
          {conversations.map((c) => (
            <li key={c.id} data-active={c.id === activeId}>
              <Link href={`${basePath}?c=${c.id}`} onClick={onOpen}>
                {c.title}
              </Link>
              <button type="button" aria-label={t.deleteChat(c.title)} onClick={() => onDelete(c.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
