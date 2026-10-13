import { CACHE_PUBLIC, handle, json } from "@/lib/api/http";
import { parseSearchQuery, searchRecipes } from "@/lib/api/recipes";

/** GET /api/recipes: search and filter the catalog. See /api/openapi.json. */
export const GET = handle("GET /api/recipes", async (request: Request) => {
  const query = parseSearchQuery(new URL(request.url).searchParams);
  return json(searchRecipes(query), { cache: CACHE_PUBLIC });
});
