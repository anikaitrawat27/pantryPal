import { readJson } from "@/lib/api/http";
import { parseBody } from "@/server/auth/accounts";
import { authedRoute } from "@/server/route";
import { replacePlan, planSchema } from "@/server/user-data";

/** PUT /api/me/plan: replaces the saved plan. Body: { entries }. */
export const PUT = authedRoute("PUT /api/me/plan", async ({ db, user, request }) => {
  const body = parseBody(planSchema, await readJson(request));
  await replacePlan(db, user.id, body.entries);
  return new Response(null, { status: 204 });
});
