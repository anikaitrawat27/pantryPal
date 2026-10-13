import { json, readJson } from "@/lib/api/http";
import { parseBody, passwordConfirmSchema, regenerateCodes } from "@/server/auth/accounts";
import { authedRoute } from "@/server/route";

/** POST /api/me/recovery-codes: replaces all recovery codes after confirming the password. */
export const POST = authedRoute("POST /api/me/recovery-codes", async ({ db, user, ip, request }) => {
  const { password } = parseBody(passwordConfirmSchema, await readJson(request));
  return json({ recoveryCodes: await regenerateCodes(db, user.id, password, ip) });
});
