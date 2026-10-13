import { json, readJson } from "@/lib/api/http";
import { parseBody, signup, signupSchema } from "@/server/auth/accounts";
import { sessionCookie } from "@/server/auth/session";
import { publicRoute } from "@/server/route";

/** POST /api/auth/signup: creates an account, signs it in, and returns its recovery codes once. */
export const POST = publicRoute("POST /api/auth/signup", async ({ db, ip, request }) => {
  const input = parseBody(signupSchema, await readJson(request));
  const { user, session, recoveryCodes } = await signup(db, input, ip);
  return json(
    { user: { username: user.username }, recoveryCodes },
    { status: 201, headers: { "Set-Cookie": sessionCookie(request, session.token, session.expiresAt) } },
  );
});
