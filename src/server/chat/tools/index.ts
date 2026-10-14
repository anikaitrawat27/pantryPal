import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import * as z from "zod/v4";
import type { Lang } from "@/i18n/config";
import { ApiError } from "@/lib/api/http";
import { generateRecipeTool } from "./generate-recipe";
import { getRecipeTool } from "./get-recipe";
import { searchRecipesTool } from "./search-recipes";
import type { ToolContext } from "./types";
import { whatCanIMakeTool } from "./what-can-i-make";

export type { ToolContext, UiEvent } from "./types";

/** Every tool the kitchen helper can call. Each one lives in its own file in this folder. */
export const TOOLS = [searchRecipesTool, whatCanIMakeTool, getRecipeTool, generateRecipeTool];

/**
 * Zod's JSON Schema output carries a `$schema` key and safe-integer bounds on every int.
 * Those add nothing for the model, so they are removed; the Zod schema still validates
 * every input before a tool runs.
 */
function toToolSchema(schema: z.ZodType): Anthropic.Beta.BetaTool["input_schema"] {
  const strip = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(strip);
    if (!node || typeof node !== "object") return node;
    return Object.fromEntries(
      Object.entries(node)
        .filter(([k]) => k !== "$schema" && k !== "minimum" && k !== "maximum")
        .map(([k, v]) => [k, strip(v)]),
    );
  };
  return strip(z.toJSONSchema(schema, { target: "draft-7" })) as Anthropic.Beta.BetaTool["input_schema"];
}

/**
 * Tool definitions for the API. Schemas come from the same Zod objects used to validate input.
 * They are not marked `strict`: constrained decoding over this many optional fields and long
 * enums made the model drop the filters it meant to send. runTool validates instead and
 * returns problems to the model as errors it can fix.
 */
export const API_TOOLS: Anthropic.Beta.BetaTool[] = TOOLS.map((t) => ({
  name: t.name,
  description: t.description,
  input_schema: toToolSchema(t.input),
}));

export interface ToolOutcome {
  content: string;
  isError: boolean;
}

/** Validates the model's input against the tool's schema, runs it, and turns failures into error results. */
export async function runTool(name: string, rawInput: unknown, ctx: ToolContext): Promise<ToolOutcome> {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return { content: `Unknown tool "${name}".`, isError: true };
  // One JSON line per call, so Vercel's logs show exactly what the model asked for.
  console.info(JSON.stringify({ event: "chat_tool_call", tool: name, input: rawInput }));
  const parsed = tool.input.safeParse(rawInput);
  if (!parsed.success) return { content: `Invalid input: ${z.prettifyError(parsed.error)}`, isError: true };
  ctx.emit({ type: "tool", name, label: (tool.label as (i: unknown, l: Lang) => string)(parsed.data, ctx.lang) });
  try {
    const result = await (tool.run as (i: unknown, c: ToolContext) => Promise<unknown>)(parsed.data, ctx);
    return { content: JSON.stringify(result), isError: false };
  } catch (err) {
    if (err instanceof ApiError) return { content: err.body.error.message, isError: true };
    throw err;
  }
}
