"use client";

import type { ChatEvent } from "@/server/chat/loop";
import type { GeneratedRecipe } from "@/server/chat/generate";
import type { DisplayMessage } from "@/server/chat/history";
import { ApiClientError, apiFetch } from "./api";

/**
 * Sends one chat message and calls `onEvent` for each server-sent event as it arrives.
 * Errors before the stream starts (auth, validation, daily limit) throw ApiClientError.
 */
export async function streamChat(
  body: { conversationId: string | null; message: string; lang: "en" | "es" },
  onEvent: (event: ChatEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new ApiClientError(res.status, await res.json().catch(() => null));

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    // Events are separated by a blank line; keep any partial event for the next chunk.
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "));
      if (line) onEvent(JSON.parse(line.slice(6)) as ChatEvent);
    }
  }
}

// The chat's regular (non-streaming) endpoints.

export interface ConversationRow {
  id: string;
  title: string;
}

export async function listConversations(): Promise<ConversationRow[]> {
  return (await apiFetch<{ conversations: ConversationRow[] }>("/api/chat/conversations")).conversations;
}

export async function loadConversation(id: string): Promise<DisplayMessage[]> {
  return (await apiFetch<{ messages: DisplayMessage[] }>(`/api/chat/conversations/${id}`)).messages;
}

export function deleteConversation(id: string) {
  return apiFetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
}

/** Adds a generated recipe to, or removes it from, My recipes. */
export function setRecipeSaved(id: string, saved: boolean) {
  return apiFetch(`/api/my-recipes/${id}`, { method: "PUT", body: { saved } });
}

export type SavedRecipe = GeneratedRecipe & { id: string; saved: boolean };

export async function listSavedRecipes(): Promise<SavedRecipe[]> {
  return (await apiFetch<{ recipes: SavedRecipe[] }>("/api/my-recipes")).recipes;
}

export function getGeneratedRecipe(id: string): Promise<SavedRecipe> {
  return apiFetch<SavedRecipe>(`/api/my-recipes/${id}`);
}
