import { readJson } from "@/lib/api/http";
import { parseBody } from "@/server/auth/accounts";
import { authedRoute } from "@/server/route";
import { replaceFavorites, favoritesSchema } from "@/server/user-data";

/** PUT /api/me/favorites: replaces the saved favorites. Body: { slugs }. */
export const PUT = authedRoute("PUT /api/me/favorites", async ({ db, user, request }) => {
  const body = parseBody(favoritesSchema, await readJson(request));
  await replaceFavorites(db, user.id, body.slugs);
  return new Response(null, { status: 204 });
});
