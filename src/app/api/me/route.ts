import { json, readJson } from "@/lib/api/http";
import { codesLeft, deleteAccount, parseBody, passwordConfirmSchema } from "@/server/auth/accounts";
import { clearedSessionCookie, readSessionToken, validateSession } from "@/server/auth/session";
import { authedRoute, publicRoute } from "@/server/route";

/** GET /api/me: the signed-in user, or `{ user: null }`. Never 401, so pages can call it freely. */
export const GET = publicRoute("GET /api/me", async ({ db, request }) => {
  const token = readSessionToken(request);
  const session = token ? await validateSession(db, token) : null;
  if (!session) return json({ user: null });
  return json({ user: { username: session.user.username, recoveryCodesLeft: await codesLeft(db, session.user.id) } });
});

/** DELETE /api/me: deletes the account and all its data after confirming the password. */
export const DELETE = authedRoute("DELETE /api/me", async ({ db, user, request }) => {
  const { password } = parseBody(passwordConfirmSchema, await readJson(request));
  await deleteAccount(db, user.id, password);
  return new Response(null, { status: 204, headers: { "Set-Cookie": clearedSessionCookie(request) } });
});
