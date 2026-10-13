import { CACHE_PUBLIC, handle, json } from "@/lib/api/http";
import { parseDetailQuery, recipeDetail } from "@/lib/api/recipes";

/** GET /api/recipes/{slug}: one recipe, scaled and with swaps applied. See /api/openapi.json. */
export const GET = handle(
  "GET /api/recipes/[slug]",
  async (request: Request, { params }: { params: Promise<{ slug: string }> }) => {
    const query = parseDetailQuery(new URL(request.url).searchParams);
    return json(recipeDetail((await params).slug, query), { cache: CACHE_PUBLIC });
  },
);
