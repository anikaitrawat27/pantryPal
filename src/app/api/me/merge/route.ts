import { json, readJson } from "@/lib/api/http";
import { parseBody } from "@/server/auth/accounts";
import { authedRoute } from "@/server/route";
import { getUserData, mergeUserData, saveUserData, userDataSchema } from "@/server/user-data";

/** POST /api/me/merge: folds data saved in the browser before signing in into the account, and returns the result. */
export const POST = authedRoute("POST /api/me/merge", async ({ db, user, request }) => {
  const local = parseBody(userDataSchema, await readJson(request));
  const merged = mergeUserData(await getUserData(db, user.id), local);
  await saveUserData(db, user.id, merged);
  return json(merged);
});
