/**
 * A minimal stand-in for the Anthropic Messages API, for end-to-end tests.
 * The app's real SDK client talks to it through ANTHROPIC_BASE_URL, so streaming,
 * tool calls, and structured output all go through the real code paths.
 *
 * Scripted behavior:
 * - A request whose last message holds tool results gets a short text reply.
 * - A message mentioning "write" gets a generate_recipe tool call; the nested
 *   structured-output request gets a valid recipe.
 * - Anything else gets a search_recipes tool call for chickpeas.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_ANTHROPIC_PORT ?? 3199);

const RECIPE = {
  title: "Chickpea Tomato Skillet",
  blurb: "Chickpeas simmered with tomato and garlic until thick. Good over rice or with bread.",
  course: "main",
  meal: ["lunch", "dinner"],
  cuisine: "mediterranean",
  equipment: ["stovetop"],
  difficulty: "1",
  prepMinutes: 5,
  cookMinutes: 15,
  servings: 2,
  ingredients: [
    { id: "chickpeas", amount: 1, unit: "can", note: "drained", optional: false },
    { id: "diced-tomatoes", amount: 1, unit: "can", note: null, optional: false },
    { id: "garlic", amount: 2, unit: "clove", note: "minced", optional: false },
    { id: "oil", amount: 1, unit: "tbsp", note: null, optional: false },
    { id: "salt", amount: null, unit: null, note: null, optional: false },
  ],
  steps: [
    "Heat the oil in a skillet over medium heat and cook the garlic for 1 minute.",
    "Add the tomatoes and chickpeas and simmer for 12 minutes, stirring now and then, until thick.",
    "Season with salt and serve.",
  ],
  tips: [],
  es: null,
};

type Msg = { role: string; content: string | { type: string; text?: string }[] };

function sse(res: import("node:http").ServerResponse, events: object[]) {
  res.writeHead(200, { "content-type": "text/event-stream" });
  for (const e of events) res.write(`event: ${(e as { type: string }).type}\ndata: ${JSON.stringify(e)}\n\n`);
  res.end();
}

function streamReply(
  blocks: ({ type: "text"; text: string } | { type: "tool_use"; name: string; input: object })[],
  stop: string,
) {
  const events: object[] = [
    {
      type: "message_start",
      message: {
        id: `msg_${Date.now()}`,
        type: "message",
        role: "assistant",
        model: "claude-sonnet-5-5",
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 50, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 },
      },
    },
  ];
  blocks.forEach((b, index) => {
    if (b.type === "text") {
      events.push({ type: "content_block_start", index, content_block: { type: "text", text: "" } });
      for (const word of b.text.split(/(?<= )/)) {
        events.push({ type: "content_block_delta", index, delta: { type: "text_delta", text: word } });
      }
    } else {
      events.push({
        type: "content_block_start",
        index,
        content_block: { type: "tool_use", id: `toolu_${index}_${Date.now()}`, name: b.name, input: {} },
      });
      events.push({
        type: "content_block_delta",
        index,
        delta: { type: "input_json_delta", partial_json: JSON.stringify(b.input) },
      });
    }
    events.push({ type: "content_block_stop", index });
  });
  events.push({
    type: "message_delta",
    delta: { stop_reason: stop, stop_sequence: null },
    usage: { output_tokens: 20 },
  });
  events.push({ type: "message_stop" });
  return events;
}

const lastUserText = (messages: Msg[]) => {
  const m = [...messages].reverse().find((x) => x.role === "user");
  if (!m) return "";
  return typeof m.content === "string" ? m.content : m.content.map((b) => b.text ?? "").join(" ");
};

const endsWithToolResults = (messages: Msg[]) => {
  const last = messages[messages.length - 1];
  return Array.isArray(last.content) && last.content.some((b) => b.type === "tool_result");
};

createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    if (req.url === "/health") {
      res.writeHead(200).end("ok");
      return;
    }
    if (req.method !== "POST" || !req.url?.startsWith("/v1/messages")) {
      res.writeHead(404).end();
      return;
    }
    const body = JSON.parse(raw) as { stream?: boolean; messages: Msg[]; output_config?: { format?: unknown } };

    if (body.output_config?.format) {
      // Structured-output request from the recipe generator.
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          id: "msg_gen",
          type: "message",
          role: "assistant",
          model: "claude-sonnet-5-5",
          content: [{ type: "text", text: JSON.stringify(RECIPE) }],
          stop_reason: "end_turn",
          stop_sequence: null,
          usage: { input_tokens: 500, output_tokens: 300 },
        }),
      );
      return;
    }

    if (endsWithToolResults(body.messages)) {
      sse(res, streamReply([{ type: "text", text: "Here are a few good options for you." }], "end_turn"));
    } else if (/write/i.test(lastUserText(body.messages))) {
      sse(
        res,
        streamReply(
          [
            {
              type: "tool_use",
              name: "generate_recipe",
              input: { request: "a chickpea and tomato dish", mustUse: ["chickpeas"] },
            },
          ],
          "tool_use",
        ),
      );
    } else {
      sse(
        res,
        streamReply(
          [{ type: "tool_use", name: "search_recipes", input: { ingredients: ["chickpeas"], limit: 3 } }],
          "tool_use",
        ),
      );
    }
  });
}).listen(PORT, () => console.log(`mock Anthropic API on ${PORT}`));
