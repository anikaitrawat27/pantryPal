import { z } from "zod";
import { json, readJson } from "@/lib/api/http";
import { parseBody } from "@/server/auth/accounts";
import { getGeneratedRecipe, setSaved } from "@/server/my-recipes";
import { authedRoute } from "@/server/route";

type Params = { id: string };

/** GET /api/my-recipes/{id}: one generated recipe, saved or not. */
export const GET = authedRoute<Params>("GET /api/my-recipes/[id]", async ({ db, user }, { params }) =>
  json(await getGeneratedRecipe(db, user.id, (await params).id)),
);

/** PUT /api/my-recipes/{id}: `{ saved: boolean }` adds it to or removes it from My recipes. */
export const PUT = authedRoute<Params>("PUT /api/my-recipes/[id]", async ({ db, user, request }, { params }) => {
  const { saved } = parseBody(z.object({ saved: z.boolean() }).strict(), await readJson(request));
  await setSaved(db, user.id, (await params).id, saved);
  return new Response(null, { status: 204 });
});
