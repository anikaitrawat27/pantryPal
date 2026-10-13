import "server-only";
import { ApiError, handle } from "@/lib/api/http";
import { clientIp, isSameOrigin } from "./auth/request";
import { readSessionToken, sessionCookie, validateSession, type SessionUser } from "./auth/session";
import { getDb, type Db } from "./db";

export interface RouteContext {
  db: Db;
  ip: string;
  request: Request;
}

export interface AuthedContext extends RouteContext {
  user: SessionUser;
}

/** Rejects cross-site requests on anything that changes state. */
function guardOrigin(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD" && !isSameOrigin(request)) {
    throw ApiError.forbidden("Cross-site requests are not allowed.");
  }
}

/** A route that may run signed out. State-changing methods must come from this site. */
export function publicRoute(name: string, fn: (ctx: RouteContext) => Promise<Response>) {
  return handle(name, async (request: Request) => {
    guardOrigin(request);
    return fn({ db: await getDb(), ip: clientIp(request), request });
  });
}

/**
 * A route that requires a signed-in user. Returns 401 without a valid session, and
 * re-sends the session cookie when the session was extended.
 */
export function authedRoute<P = Record<string, never>>(
  name: string,
  fn: (ctx: AuthedContext, route: { params: Promise<P> }) => Promise<Response>,
) {
  return handle(name, async (request: Request, route: { params: Promise<P> }) => {
    guardOrigin(request);
    const db = await getDb();
    const token = readSessionToken(request);
    const session = token ? await validateSession(db, token) : null;
    if (!token || !session) throw ApiError.unauthorized("Sign in to continue.");
    const response = await fn({ db, ip: clientIp(request), request, user: session.user }, route);
    if (session.renewed) response.headers.append("Set-Cookie", sessionCookie(request, token, session.expiresAt));
    return response;
  });
}
