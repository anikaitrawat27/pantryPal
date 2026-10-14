import { handle, json, readJson } from "@/lib/api/http";
import { parseShoppingListBody, shoppingList } from "@/lib/api/shopping-list";

/** POST /api/shopping-list: combine planned meals into one priced list. See /api/openapi.json. */
export const POST = handle("POST /api/shopping-list", async (request: Request) => {
  const body = parseShoppingListBody(await readJson(request));
  return json(shoppingList(body));
});
