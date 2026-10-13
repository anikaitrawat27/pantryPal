import { json } from "@/lib/api/http";
import { listSavedRecipes } from "@/server/my-recipes";
import { authedRoute } from "@/server/route";

/** GET /api/my-recipes: recipes the chatbot wrote that the user saved. */
export const GET = authedRoute("GET /api/my-recipes", async ({ db, user }) =>
  json({ recipes: await listSavedRecipes(db, user.id) }),
);
