import { json, readJson } from "@/lib/api/http";
import { parseBody, resetPassword, resetSchema } from "@/server/auth/accounts";
import { sessionCookie } from "@/server/auth/session";
import { publicRoute } from "@/server/route";

/** POST /api/auth/reset: new password with a recovery code. Signs out every other session. */
export const POST = publicRoute("POST /api/auth/reset", async ({ db, ip, request }) => {
  const input = parseBody(resetSchema, await readJson(request));
  const { user, session, codesLeft } = await resetPassword(db, input, ip);
  return json(
    { user: { username: user.username }, codesLeft },
    { headers: { "Set-Cookie": sessionCookie(request, session.token, session.expiresAt) } },
  );
});
