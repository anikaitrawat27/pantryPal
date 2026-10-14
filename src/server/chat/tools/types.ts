import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import * as z from "zod/v4";
import { INGREDIENTS } from "@/data/pantry";
import type { Lang } from "@/i18n/config";
import type { RecipeListItem } from "@/lib/api/search";
import type { Db } from "@/server/db";
import type { GeneratedRecipe } from "../generate";

export const STOCKABLE_IDS = INGREDIENTS.filter((i) => i.tier !== "free").map((i) => i.id) as [string, ...string[]];
export const ingredientIds = z.array(z.enum(STOCKABLE_IDS));

/** What the page renders for a turn, besides streamed text. Stored with the turn so a thread reloads the same way. */
export type UiEvent =
  | { type: "tool"; name: string; label: string }
  | { type: "recipes"; items: RecipeListItem[] }
  | { type: "generated"; id: string; recipe: GeneratedRecipe };

export interface ToolContext {
  db: Db;
  userId: string;
  lang: Lang;
  client: Anthropic;
  signal?: AbortSignal;
  emit: (event: UiEvent) => void;
}

export interface ChatTool<S extends z.ZodType> {
  name: string;
  description: string;
  input: S;
  label: (input: z.infer<S>, lang: Lang) => string;
  run: (input: z.infer<S>, ctx: ToolContext) => Promise<unknown>;
}

export const defineTool = <S extends z.ZodType>(t: ChatTool<S>) => t;
