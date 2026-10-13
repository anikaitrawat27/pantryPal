import "server-only";

/** Client IP as reported by Vercel's proxy (first X-Forwarded-For entry). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Cross-site request forgery guard for state-changing requests. Browsers always send
 * Origin on POST, PUT, and DELETE, so a request from another site, or one with no
 * Origin at all, is rejected. SameSite=Lax cookies are a second layer.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
