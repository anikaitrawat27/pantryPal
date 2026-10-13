import { readJson } from "@/lib/api/http";
import { parseBody } from "@/server/auth/accounts";
import { authedRoute } from "@/server/route";
import { replaceChecks, checksSchema } from "@/server/user-data";

/** PUT /api/me/checks: replaces the saved checks. Body: { ingredientIds }. */
export const PUT = authedRoute("PUT /api/me/checks", async ({ db, user, request }) => {
  const body = parseBody(checksSchema, await readJson(request));
  await replaceChecks(db, user.id, body.ingredientIds);
  return new Response(null, { status: 204 });
});
