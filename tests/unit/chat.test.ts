import type Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { randomId } from "@/server/auth/crypto";
import { checkGenerated, generateRecipe } from "@/server/chat/generate";
import { loadDisplayMessages } from "@/server/chat/history";
import { echoSafe, MAX_STEPS, runChatTurn, type ChatEvent } from "@/server/chat/loop";
import { API_TOOLS } from "@/server/chat/tools";
import { openPglite, type Db } from "@/server/db";
import { chatMessages, chatUsage, generatedRecipes, users } from "@/server/db/schema";

let db: Db;
let userId: string;

beforeAll(async () => {
  db = await openPglite("memory://");
}, 30_000);

beforeEach(async () => {
  userId = randomId();
  await db.insert(users).values({ id: userId, username: userId, usernameKey: userId, passwordHash: "x" });
});

// A scripted stand-in for the Anthropic client: each stream() call plays the next response.

type Block = Record<string, unknown>;
interface Scripted {
  content: Block[];
  stop_reason: string;
}

function fakeClient(script: Scripted[], parses: unknown[] = []) {
  const streamCalls: Record<string, unknown>[] = [];
  const parseCalls: Record<string, unknown>[] = [];
  const client = {
    beta: {
      messages: {
        stream(params: Record<string, unknown>) {
          // Snapshot: the loop keeps appending to the same array after the call.
          streamCalls.push(structuredClone(params));
          const r = script.shift();
          if (!r) throw new Error("Script ran out of responses");
          const events = r.content
            .filter((b) => b.type === "text")
            .map((b) => ({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: b.text } }));
          return {
            async *[Symbol.asyncIterator]() {
              yield* events;
            },
            finalMessage: async () => ({
              ...r,
              usage: {
                input_tokens: 100,
                output_tokens: 20,
                cache_read_input_tokens: 50,
                cache_creation_input_tokens: 0,
              },
            }),
          };
        },
      },
    },
    messages: {
      async parse(params: Record<string, unknown>) {
        // The output format object holds functions, so snapshot only the messages.
        parseCalls.push({ messages: structuredClone(params.messages) });
        const parsed = parses.shift();
        return {
          parsed_output: parsed,
          stop_reason: "end_turn",
          content: [{ type: "text", text: JSON.stringify(parsed) }],
        };
      },
    },
  };
  return { client: client as unknown as Anthropic, streamCalls, parseCalls };
}

const text = (t: string): Scripted => ({ content: [{ type: "text", text: t }], stop_reason: "end_turn" });
const toolUse = (name: string, input: unknown, id = `tu_${Math.random().toString(36).slice(2)}`): Scripted => ({
  content: [
    { type: "thinking", thinking: "", signature: "sig" },
    { type: "tool_use", id, name, input },
  ],
  stop_reason: "tool_use",
});

async function turn(
  client: Anthropic,
  message: string,
  conversationId: string | null = null,
  lang: "en" | "es" = "en",
) {
  const events: ChatEvent[] = [];
  await runChatTurn({ db, client, userId, conversationId, text: message, lang, emit: (e) => events.push(e) });
  const conv = events.find((e) => e.type === "conversation") as { id: string };
  return { events, conversationId: conv.id };
}

describe("chat loop", () => {
  it("runs a tool, streams cards and text, and stores the full transcript", async () => {
    const { client, streamCalls } = fakeClient([
      toolUse("search_recipes", { query: "chickpea", limit: 2 }),
      text("Try these two."),
    ]);
    const { events, conversationId } = await turn(client, "Anything with chickpeas?");

    expect(events.map((e) => e.type)).toEqual(["conversation", "tool", "recipes", "text", "done"]);
    const recipes = events.find((e) => e.type === "recipes") as { items: { slug: string }[] };
    expect(recipes.items).toHaveLength(2);

    // The second call carries the tool result, with the recipes the tool found.
    const second = streamCalls[1].messages as Anthropic.Beta.BetaMessageParam[];
    const result = (second[2].content as Anthropic.Beta.BetaToolResultBlockParam[])[0];
    expect(result.type).toBe("tool_result");
    expect(JSON.parse(result.content as string).recipes.map((r: { slug: string }) => r.slug)).toEqual(
      recipes.items.map((r) => r.slug),
    );

    const rows = await db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId));
    expect(rows.map((r) => r.role)).toEqual(["user", "assistant", "user", "assistant"]);
    // Thinking blocks are stored and replayed unchanged.
    expect((rows[1].content as Block[])[0]).toEqual({ type: "thinking", thinking: "", signature: "sig" });
  });

  it("sends the configured model, fallbacks, low effort, strict tools, and prompt caching", async () => {
    const { client, streamCalls } = fakeClient([text("Hi.")]);
    await turn(client, "hello");
    expect(streamCalls[0]).toMatchObject({
      model: "claude-sonnet-5-5",
      fallbacks: "default",
      betas: ["server-side-fallback-2026-07-01"],
      output_config: { effort: "low" },
      cache_control: { type: "ephemeral" },
    });
    for (const t of streamCalls[0].tools as { strict: boolean }[]) expect(t.strict).toBe(true);
  });

  it("replays history append-only on the next turn", async () => {
    const first = fakeClient([toolUse("search_recipes", { query: "soup" }), text("Here are soups.")]);
    const { conversationId } = await turn(first.client, "soups?");
    const firstHistory = [
      ...(first.streamCalls[1].messages as unknown[]),
      { role: "assistant", content: [{ type: "text", text: "Here are soups." }] },
    ];

    const second = fakeClient([text("Sure.")]);
    await turn(second.client, "cheaper ones?", conversationId);
    const sent = second.streamCalls[0].messages as unknown[];
    expect(sent.slice(0, firstHistory.length)).toEqual(firstHistory);
    expect(sent[firstHistory.length]).toEqual({ role: "user", content: [{ type: "text", text: "cheaper ones?" }] });
  });

  it("returns invalid tool input to the model as an error instead of running the tool", async () => {
    const { client, streamCalls } = fakeClient([toolUse("search_recipes", { courses: ["brunch"] }), text("Sorry.")]);
    const { events } = await turn(client, "brunch?");
    expect(events.some((e) => e.type === "recipes")).toBe(false);
    const result = (
      (streamCalls[1].messages as Anthropic.Beta.BetaMessageParam[])[2]
        .content as Anthropic.Beta.BetaToolResultBlockParam[]
    )[0];
    expect(result.is_error).toBe(true);
    expect(result.content).toMatch(/Invalid input/);
  });

  it("reports unknown recipes as tool errors", async () => {
    const { client, streamCalls } = fakeClient([toolUse("get_recipe", { slug: "no-such-recipe" }), text("Not found.")]);
    await turn(client, "open it");
    const result = (
      (streamCalls[1].messages as Anthropic.Beta.BetaMessageParam[])[2]
        .content as Anthropic.Beta.BetaToolResultBlockParam[]
    )[0];
    expect(result).toMatchObject({ is_error: true, content: 'No recipe with slug "no-such-recipe".' });
  });

  it("handles a refusal without storing a reply", async () => {
    const { client } = fakeClient([{ content: [], stop_reason: "refusal" }]);
    const { events, conversationId } = await turn(client, "something off topic");
    expect(events.find((e) => e.type === "error")).toMatchObject({ code: "refusal" });
    const rows = await db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId));
    expect(rows.map((r) => r.role)).toEqual(["user"]);
  });

  it(`stops after ${MAX_STEPS} model calls`, async () => {
    const { client, streamCalls } = fakeClient(Array.from({ length: MAX_STEPS }, () => toolUse("search_recipes", {})));
    const { events } = await turn(client, "loop forever");
    expect(streamCalls).toHaveLength(MAX_STEPS);
    expect(events.find((e) => e.type === "error")).toMatchObject({ code: "too_many_steps" });
  });

  it("enforces the daily message limit and records token usage", async () => {
    const { client } = fakeClient([text("ok")]);
    await turn(client, "hi");
    const [usage] = await db.select().from(chatUsage).where(eq(chatUsage.userId, userId));
    expect(usage).toMatchObject({ messages: 1, inputTokens: 100, outputTokens: 20, cacheReadTokens: 50 });

    await db.update(chatUsage).set({ messages: 30 }).where(eq(chatUsage.userId, userId));
    await expect(turn(fakeClient([]).client, "one more")).rejects.toMatchObject({ status: 429 });
  });

  it("uses the saved pantry for what_can_i_make", async () => {
    const { client, streamCalls } = fakeClient([toolUse("what_can_i_make", { maxMissing: 2 }), text("Done.")]);
    const { replacePantry } = await import("@/server/user-data");
    await replacePantry(db, userId, { have: ["rice", "eggs", "canned-peas"], low: [] });
    await turn(client, "what can I make?");
    const result = (
      (streamCalls[1].messages as Anthropic.Beta.BetaMessageParam[])[2]
        .content as Anthropic.Beta.BetaToolResultBlockParam[]
    )[0];
    const body = JSON.parse(result.content as string);
    expect(body.usedIngredients).toEqual(["canned-peas", "eggs", "rice"]);
    expect(body.recipes.map((r: { slug: string }) => r.slug)).toContain("chinese-fried-rice");
  });

  it("reloads a conversation as it was shown", async () => {
    const { client } = fakeClient([toolUse("search_recipes", { query: "rice", limit: 1 }), text("Found one.")]);
    const { conversationId } = await turn(client, "rice dishes");
    const display = await loadDisplayMessages(db, userId, conversationId);
    expect(display.messages).toHaveLength(2);
    expect(display.messages[0]).toEqual({ role: "user", text: "rice dishes" });
    expect(display.messages[1]).toMatchObject({ role: "assistant", text: "Found one." });
    expect((display.messages[1] as { ui: { type: string }[] }).ui.map((u) => u.type)).toEqual(["tool", "recipes"]);
  });

  it("keeps other users out of a conversation", async () => {
    const { conversationId } = await turn(fakeClient([text("hi")]).client, "hi");
    const otherUser = randomId();
    await expect(loadDisplayMessages(db, otherUser, conversationId)).rejects.toMatchObject({ status: 404 });
  });
});

describe("echoSafe", () => {
  it("drops non-text blocks from before a mid-stream fallback", () => {
    const content = [
      { type: "thinking", thinking: "", signature: "a" },
      { type: "text", text: "Partial" },
      { type: "tool_use", id: "x", name: "search_recipes", input: {} },
      { type: "fallback", from: { model: "a" }, to: { model: "b" } },
      { type: "thinking", thinking: "", signature: "b" },
      { type: "text", text: "Rest" },
    ] as unknown as Anthropic.Beta.BetaContentBlock[];
    expect(echoSafe(content).map((b) => b.type)).toEqual(["text", "fallback", "thinking", "text"]);
  });
});

describe("tool definitions", () => {
  it("are strict, closed, and free of unsupported keywords", () => {
    const json = JSON.stringify(API_TOOLS);
    expect(json).not.toContain("$schema");
    expect(json).not.toContain('"minimum"');
    for (const t of API_TOOLS) expect(t.input_schema).toMatchObject({ type: "object", additionalProperties: false });
  });
});

// A recipe in the generator's output shape.
const good = {
  title: "Peanut Rice Bowl",
  blurb: "Warm rice with a quick peanut sauce and peas. Ready in about 20 minutes.",
  course: "main",
  meal: ["lunch", "dinner"],
  cuisine: "thai",
  equipment: ["stovetop"],
  difficulty: "1",
  prepMinutes: 5,
  cookMinutes: 15,
  servings: 2,
  ingredients: [
    { id: "rice", amount: 1, unit: "cup", note: null, optional: false },
    { id: "water", amount: 2, unit: "cup", note: null, optional: false },
    { id: "peanut-butter", amount: 2, unit: "tbsp", note: null, optional: false },
    { id: "canned-peas", amount: 0.5, unit: "can", note: "drained", optional: false },
    { id: "soy-sauce", amount: 1, unit: "tbsp", note: null, optional: true },
    { id: "salt", amount: null, unit: null, note: null, optional: false },
  ],
  steps: [
    "Bring the water to a boil in a pot, stir in the rice, cover, and simmer on low for 15 minutes.",
    "Whisk the peanut butter, soy sauce, and a splash of hot water until smooth.",
    "Warm the peas in the pot with the rice for the last 2 minutes.",
    "Spoon the sauce over the rice and peas, season with salt, and serve.",
  ],
  tips: [],
  es: null,
};

describe("recipe generation", () => {
  it("accepts a recipe that follows every rule", () => {
    expect(checkGenerated(good as never, "peanut-rice-bowl-abc", "en").problems).toEqual([]);
  });

  it("catches oven words, tools that do not match, amounts in steps, and bad units", () => {
    const bad = {
      ...good,
      equipment: ["stovetop", "blender"],
      steps: ["Preheat the oven.", "Add 2 tbsp peanut butter to the pot."],
      ingredients: [...good.ingredients, { id: "ground-beef", amount: 1, unit: "cup", note: null, optional: false }],
    };
    const problems = checkGenerated(bad as never, "x-abc", "en").problems.join("\n");
    expect(problems).toMatch(/oven/);
    expect(problems).toMatch(/hard-coded amount "2 tbsp"/);
    expect(problems).toMatch(/lists blender but no step uses it/);
    expect(problems).toMatch(/Unit not allowed for ground-beef/);
  });

  it("requires valid Spanish text for Spanish conversations", () => {
    expect(checkGenerated(good as never, "x-abc", "es").problems).toEqual([
      'The conversation is in Spanish, so fill in "es".',
    ]);
    const withEs = {
      ...good,
      es: {
        title: "Tazón de arroz con cacahuate",
        blurb: "Arroz caliente con una salsa rápida de cacahuate y chícharos.",
        steps: ["Hierva el agua.", "Bata la crema de cacahuate.", "Caliente los chícharos.", "Sirva."],
        tips: [],
        notes: [{ id: "canned-peas", note: "escurridos" }],
      },
    };
    expect(checkGenerated(withEs as never, "x-abc", "es").problems).toEqual([]);
  });

  it("feeds validation problems back and succeeds on a corrected attempt", async () => {
    const broken = { ...good, steps: ["Bake until golden.", ...good.steps.slice(1)] };
    const { client, parseCalls } = fakeClient([], [broken, good]);
    const outcome = await generateRecipe(
      client,
      { request: "a peanut rice bowl", mustUse: ["rice"], lang: "en" },
      "abc123",
    );
    expect(outcome.ok).toBe(true);
    expect(outcome.attempts).toBe(2);
    const feedback = (parseCalls[1].messages as { role: string; content: string }[]).at(-1)!;
    expect(feedback.role).toBe("user");
    expect(feedback.content).toMatch(/failed validation[\s\S]*Bake/);
  });

  it("gives up after three failed attempts", async () => {
    const broken = { ...good, steps: ["Bake until golden."] };
    const { client } = fakeClient([], [broken, broken, broken]);
    const outcome = await generateRecipe(client, { request: "x", mustUse: [], lang: "en" }, "abc123");
    expect(outcome).toMatchObject({ ok: false, attempts: 3 });
  });

  it("stores a generated recipe from the chat and shows its card", async () => {
    const { client } = fakeClient(
      [toolUse("generate_recipe", { request: "peanut rice bowl" }), text("Here is a new recipe.")],
      [good],
    );
    const { events } = await turn(client, "make me something with peanut butter and rice");
    const generated = events.find((e) => e.type === "generated") as { id: string };
    expect(generated).toBeDefined();
    const [row] = await db.select().from(generatedRecipes).where(eq(generatedRecipes.id, generated.id));
    expect(row).toMatchObject({ userId, saved: false });
  });
});
