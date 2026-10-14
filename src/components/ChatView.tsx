"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useDict, useLang } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { useAccount } from "@/client/account";
import { ApiClientError } from "@/client/api";
import type { RecipeListItem } from "@/lib/api/search";
import { streamChat } from "@/client/chat";
import { formatUsd } from "@/lib/nutrition";
import type { DisplayMessage } from "@/server/chat/history";
import type { UiEvent } from "@/server/chat/tools";
import styles from "./ChatView.module.css";
import { CourseDoodle } from "./Doodle";
import { RichText } from "./RichText";
import ui from "./ui.module.css";

type Message = DisplayMessage & { pending?: boolean };
interface ConversationRow {
  id: string;
  title: string;
}

function RecipeChip({ r }: { r: RecipeListItem }) {
  const d = useDict();
  return (
    <Link href={r.url} className={`${ui.card} ${styles.recipe}`}>
      <CourseDoodle course={r.course as never} size={36} />
      <span>
        <strong>{r.title}</strong>
        <small>
          {d.units.minutes(r.totalMinutes)} · {formatUsd(r.costPerServingUsd)}
          {r.pantryMatch && r.pantryMatch.missing.length > 0 && ` · ${d.card.missingN(r.pantryMatch.missing.length)}`}
        </small>
      </span>
    </Link>
  );
}

function GeneratedCard({ event }: { event: Extract<UiEvent, { type: "generated" }> }) {
  const t = useDict().chat;
  const d = useDict();
  const lang = useLang();
  const [saved, setSaved] = useState(false);
  const { recipe, es } = event.recipe;
  const text = lang === "es" && es ? es : recipe;
  return (
    <article className={`${ui.card} ${styles.generated}`}>
      <p className={styles.badge}>{t.newRecipe}</p>
      <h3>{text.title}</h3>
      <p>{text.blurb}</p>
      <p className={styles.meta}>
        {d.units.minutes(recipe.prep + recipe.cook)} · {recipe.serves} {d.recipe.servingsN(recipe.serves)} ·{" "}
        {formatUsd(event.recipe.costPerServingUsd)} · {event.recipe.nutrition.kcal} {d.recipe.calories.toLowerCase()}
      </p>
      <p className={styles.checked}>✓ {t.checked}</p>
      <div className={styles.row}>
        <Link href={`${localePath(lang, "/my-recipes")}?id=${event.id}`} className={ui.button}>
          {t.open}
        </Link>
        <button
          type="button"
          className={`${ui.button} ${saved ? "" : ui.primary}`}
          aria-pressed={saved}
          onClick={async () => {
            const next = !saved;
            setSaved(next);
            const res = await fetch(`/api/my-recipes/${event.id}`, {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ saved: next }),
            });
            if (!res.ok) setSaved(!next);
          }}
        >
          {saved ? t.saved : t.save}
        </button>
      </div>
    </article>
  );
}

function MessageView({ m }: { m: Message }) {
  const t = useDict().chat;
  if (m.role === "user") {
    return (
      <div className={styles.user}>
        <span className="sr-only">{t.you}: </span>
        {m.text}
      </div>
    );
  }
  const tools = m.ui.filter((u): u is Extract<UiEvent, { type: "tool" }> => u.type === "tool");
  const recipes = m.ui.flatMap((u) => (u.type === "recipes" ? u.items : []));
  const unique = [...new Map(recipes.map((r) => [r.slug, r])).values()];
  const generated = m.ui.filter((u): u is Extract<UiEvent, { type: "generated" }> => u.type === "generated");
  return (
    <div className={styles.assistant}>
      <span className="sr-only">{t.helper}: </span>
      {tools.length > 0 && (
        <ul className={styles.tools}>
          {tools.map((tool, i) => (
            <li key={i} data-pending={m.pending && i === tools.length - 1 && !m.text}>
              {tool.label}
            </li>
          ))}
        </ul>
      )}
      {generated.map((g) => (
        <GeneratedCard key={g.id} event={g} />
      ))}
      {unique.length > 0 && (
        <div className={styles.recipes}>
          {unique.map((r) => (
            <RecipeChip key={r.slug} r={r} />
          ))}
        </div>
      )}
      {m.text ? (
        <RichText text={m.text} />
      ) : (
        m.pending && tools.length === 0 && <p className={styles.thinking}>{t.sending}</p>
      )}
    </div>
  );
}

export function ChatView() {
  const d = useDict();
  const t = d.chat;
  const lang = useLang();
  const account = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const conversationId = params.get("c");
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  // Set when this page created the conversation, so the URL change does not reload it.
  const createdHere = useRef<string | null>(null);

  const loadList = useCallback(async () => {
    const res = await fetch("/api/chat/conversations");
    if (res.ok) setConversations((await res.json()).conversations);
  }, []);

  useEffect(() => {
    if (account.status === "user") void loadList();
  }, [account.status, loadList]);

  useEffect(() => {
    if (account.status !== "user") return;
    if (!conversationId) return setMessages([]);
    if (createdHere.current === conversationId) return;
    void fetch(`/api/chat/conversations/${conversationId}`).then(async (res) => {
      if (res.ok) setMessages((await res.json()).messages);
      else router.replace(pathname);
    });
  }, [conversationId, account.status, pathname, router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError(null);
    setDraft("");
    setMessages((m) => [...m, { role: "user", text: message }, { role: "assistant", text: "", ui: [], pending: true }]);
    const update = (fn: (a: Extract<Message, { role: "assistant" }>) => Message) =>
      setMessages((m) => [...m.slice(0, -1), fn(m[m.length - 1] as Extract<Message, { role: "assistant" }>)]);
    try {
      await streamChat({ conversationId, message, lang }, (event) => {
        if (event.type === "conversation" && event.id !== conversationId) {
          createdHere.current = event.id;
          router.replace(`${pathname}?c=${event.id}`, { scroll: false });
        } else if (event.type === "text") update((a) => ({ ...a, text: a.text + event.delta }));
        else if (event.type === "tool" || event.type === "recipes" || event.type === "generated")
          update((a) => ({ ...a, ui: [...a.ui, event] }));
        else if (event.type === "error") setError(event.message);
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.status === 429
            ? t.errLimit
            : err.status === 503
              ? t.errUnavailable
              : (err.body?.error.message ?? t.errGeneric)
          : t.errGeneric,
      );
    } finally {
      update((a) => ({ ...a, pending: false }));
      setBusy(false);
      void loadList();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(draft);
    }
  };

  if (account.status === "loading") return <p className="hand">{t.sending}</p>;
  if (account.status === "guest") {
    return (
      <div className={`${ui.card} ${styles.gate}`}>
        <p>{t.signInPrompt}</p>
        <Link
          href={`${localePath(lang, "/login")}?next=${encodeURIComponent(pathname)}`}
          className={`${ui.button} ${ui.primary}`}
        >
          {d.auth.signIn}
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label={t.recent}>
        <button
          type="button"
          className={ui.button}
          onClick={() => {
            createdHere.current = null;
            setMessages([]);
            router.replace(pathname);
          }}
        >
          + {t.newChat}
        </button>
        <h2>{t.recent}</h2>
        {conversations.length === 0 ? (
          <p className={styles.muted}>{t.noChats}</p>
        ) : (
          <ul className={styles.convList}>
            {conversations.map((c) => (
              <li key={c.id} data-active={c.id === conversationId}>
                <Link href={`${pathname}?c=${c.id}`} onClick={() => (createdHere.current = null)}>
                  {c.title}
                </Link>
                <button
                  type="button"
                  aria-label={t.deleteChat(c.title)}
                  onClick={async () => {
                    await fetch(`/api/chat/conversations/${c.id}`, { method: "DELETE" });
                    if (c.id === conversationId) router.replace(pathname);
                    void loadList();
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

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
            <MessageView key={i} m={m} />
          ))}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div ref={endRef} />
        </div>
        <form className={styles.composer} onSubmit={onSubmit}>
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
      </section>
    </div>
  );
}
