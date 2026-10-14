"use client";

import type { ChatEvent } from "@/server/chat/loop";
import { ApiClientError } from "./api";

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
