import { readJson } from "@/lib/api/http";
import { parseBody } from "@/server/auth/accounts";
import { authedRoute } from "@/server/route";
import { replacePantry, pantrySchema } from "@/server/user-data";

/** PUT /api/me/pantry: replaces the saved pantry. Body: { have, low }. */
export const PUT = authedRoute("PUT /api/me/pantry", async ({ db, user, request }) => {
  const body = parseBody(pantrySchema, await readJson(request));
  await replacePantry(db, user.id, body);
  return new Response(null, { status: 204 });
});
