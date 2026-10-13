import { json, readJson } from "@/lib/api/http";
import { login, loginSchema, parseBody } from "@/server/auth/accounts";
import { sessionCookie } from "@/server/auth/session";
import { publicRoute } from "@/server/route";

/** POST /api/auth/login */
export const POST = publicRoute("POST /api/auth/login", async ({ db, ip, request }) => {
  const input = parseBody(loginSchema, await readJson(request));
  const { user, session } = await login(db, input, ip);
  return json(
    { user: { username: user.username } },
    { headers: { "Set-Cookie": sessionCookie(request, session.token, session.expiresAt) } },
  );
});
