"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount } from "@/client/account";
import { ApiClientError } from "@/client/api";
import {
  deleteConversation,
  listConversations,
  loadConversation,
  streamChat,
  type ConversationRow,
} from "@/client/chat";
import { useDict, useLang } from "@/i18n/client";
import type { Dict } from "@/i18n/dict";
import type { ChatEvent } from "@/server/chat/loop";
import { SignInGate } from "../SignInGate";
import ui from "../ui.module.css";
import styles from "./chat.module.css";
import { ChatMessage, type ChatMessageData } from "./ChatMessage";
import { Composer } from "./Composer";
import { ConversationList } from "./ConversationList";

type AssistantMessage = Extract<ChatMessageData, { role: "assistant" }>;

/** Turns a failed request into the message shown under the thread. */
function errorText(err: unknown, t: Dict["chat"]): string {
  if (!(err instanceof ApiClientError)) return t.errGeneric;
  if (err.status === 429) return t.errLimit;
  if (err.status === 503) return t.errUnavailable;
  return err.body?.error.message ?? t.errGeneric;
}

/**
 * The kitchen helper page. The open conversation's id lives in the URL (?c=...), so a
 * reload or a shared link shows the same thread.
 */
export function ChatView() {
  const t = useDict().chat;
  const lang = useLang();
  const account = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const conversationId = useSearchParams().get("c");

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  // The id of a conversation this page just created, so putting it in the URL does not reload it.
  const createdHere = useRef<string | null>(null);

  const refreshList = useCallback(() => {
    listConversations()
      .then(setConversations)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (account.status === "user") refreshList();
  }, [account.status, refreshList]);

  // Load the thread named in the URL.
  useEffect(() => {
    if (account.status !== "user") return;
    if (!conversationId) return setMessages([]);
    if (createdHere.current === conversationId) return;
    loadConversation(conversationId)
      .then(setMessages)
      .catch(() => router.replace(pathname));
  }, [conversationId, account.status, pathname, router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  /** Applies a change to the reply that is currently streaming in (always the last message). */
  const updateReply = (fn: (reply: AssistantMessage) => AssistantMessage) =>
    setMessages((all) => [...all.slice(0, -1), fn(all[all.length - 1] as AssistantMessage)]);

  const onEvent = (event: ChatEvent) => {
    switch (event.type) {
      case "conversation":
        if (event.id !== conversationId) {
          createdHere.current = event.id;
          router.replace(`${pathname}?c=${event.id}`, { scroll: false });
        }
        break;
      case "text":
        updateReply((r) => ({ ...r, text: r.text + event.delta }));
        break;
      case "tool":
      case "recipes":
      case "generated":
        updateReply((r) => ({ ...r, ui: [...r.ui, event] }));
        break;
      case "error":
        setError(event.message);
        break;
    }
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError(null);
    setMessages((all) => [
      ...all,
      { role: "user", text: message },
      { role: "assistant", text: "", ui: [], pending: true },
    ]);
    try {
      await streamChat({ conversationId, message, lang }, onEvent);
    } catch (err) {
      setError(errorText(err, t));
    } finally {
      updateReply((r) => ({ ...r, pending: false }));
      setBusy(false);
      refreshList();
    }
  };

  const startNew = () => {
    createdHere.current = null;
    setMessages([]);
    router.replace(pathname);
  };

  const remove = async (id: string) => {
    await deleteConversation(id);
    if (id === conversationId) router.replace(pathname);
    refreshList();
  };

  if (account.status === "loading") return <p className="hand">{t.sending}</p>;
  if (account.status === "guest") return <SignInGate message={t.signInPrompt} />;

  return (
    <div className={styles.layout}>
      <ConversationList
        conversations={conversations}
        activeId={conversationId}
        basePath={pathname}
        onNew={startNew}
        onOpen={() => (createdHere.current = null)}
        onDelete={remove}
      />
      <section className={styles.main} aria-label={t.title}>
        <div className={styles.thread} aria-live="polite">
          {messages.length === 0 && (
            <div className={styles.empty}>
              <p>{t.intro}</p>
              <ul className={styles.suggestions}>
                {t.suggestions.map((s) => (
                  <li key={s}>
                    <button type="button" className={ui.chip} onClick={() => void send(s)} disabled={busy}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} />
          ))}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div ref={endRef} />
        </div>
        <Composer busy={busy} onSend={(text) => void send(text)} />
      </section>
    </div>
  );
}
