import { clearedSessionCookie, deleteSession, readSessionToken } from "@/server/auth/session";
import { publicRoute } from "@/server/route";

/** POST /api/auth/logout: ends this session. Safe to call when already signed out. */
export const POST = publicRoute("POST /api/auth/logout", async ({ db, request }) => {
  const token = readSessionToken(request);
  if (token) await deleteSession(db, token);
  return new Response(null, { status: 204, headers: { "Set-Cookie": clearedSessionCookie(request) } });
});
