"use client";

import { useDict } from "@/i18n/client";
import type { DisplayMessage } from "@/server/chat/conversations";
import type { UiEvent } from "@/server/chat/tools";
import { RichText } from "../RichText";
import styles from "./chat.module.css";
import { GeneratedRecipeCard } from "./GeneratedRecipeCard";
import { RecipeChip } from "./RecipeChip";

/** A message in the thread. `pending` is true while the helper's reply is still streaming in. */
export type ChatMessageData = DisplayMessage & { pending?: boolean };

type ToolEvent = Extract<UiEvent, { type: "tool" }>;
type GeneratedEvent = Extract<UiEvent, { type: "generated" }>;

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const t = useDict().chat;
  if (message.role === "user") {
    return (
      <div className={styles.user}>
        <span className="sr-only">{t.you}: </span>
        {message.text}
      </div>
    );
  }

  // One reply can include tool activity, newly written recipes, and catalog recipe cards.
  const tools = message.ui.filter((u): u is ToolEvent => u.type === "tool");
  const generated = message.ui.filter((u): u is GeneratedEvent => u.type === "generated");
  const recipes = message.ui.flatMap((u) => (u.type === "recipes" ? u.items : []));
  const uniqueRecipes = [...new Map(recipes.map((r) => [r.slug, r])).values()];
  const stillWorking = message.pending && !message.text;

  return (
    <div className={styles.assistant}>
      <span className="sr-only">{t.helper}: </span>
      {tools.length > 0 && (
        <ul className={styles.tools}>
          {tools.map((tool, i) => (
            <li key={i} data-pending={stillWorking && i === tools.length - 1}>
              {tool.label}
            </li>
          ))}
        </ul>
      )}
      {generated.map((g) => (
        <GeneratedRecipeCard key={g.id} event={g} />
      ))}
      {uniqueRecipes.length > 0 && (
        <div className={styles.recipes}>
          {uniqueRecipes.map((r) => (
            <RecipeChip key={r.slug} recipe={r} />
          ))}
        </div>
      )}
      {message.text && <RichText text={message.text} />}
      {stillWorking && tools.length === 0 && <p className={styles.thinking}>{t.sending}</p>}
    </div>
  );
}
