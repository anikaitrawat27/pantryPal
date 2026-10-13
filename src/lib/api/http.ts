import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/** The one error shape every endpoint returns. */
export interface ApiErrorBody {
  error: {
    code:
      | "invalid_request"
      | "unauthorized"
      | "forbidden"
      | "not_found"
      | "conflict"
      | "rate_limited"
      | "internal_error";
    message: string;
    /** For invalid_request: what is wrong with each field, keyed by its path ("meals.2.slug"). */
    fields?: Record<string, string>;
  };
}

/** Thrown inside handlers to return a 4xx without building the response by hand. */
export class ApiError extends Error {
  constructor(
    readonly status: 400 | 401 | 403 | 404 | 409 | 429,
    readonly body: ApiErrorBody,
    /** For 429: seconds until the client may retry, sent as Retry-After. */
    readonly retryAfter?: number,
  ) {
    super(body.error.message);
  }

  static invalid(message: string, fields?: Record<string, string>) {
    return new ApiError(400, { error: { code: "invalid_request", message, ...(fields ? { fields } : {}) } });
  }

  static notFound(message: string) {
    return new ApiError(404, { error: { code: "not_found", message } });
  }

  static unauthorized(message: string) {
    return new ApiError(401, { error: { code: "unauthorized", message } });
  }

  static forbidden(message: string) {
    return new ApiError(403, { error: { code: "forbidden", message } });
  }

  static conflict(message: string, fields?: Record<string, string>) {
    return new ApiError(409, { error: { code: "conflict", message, ...(fields ? { fields } : {}) } });
  }

  static rateLimited(retryAfter: number) {
    return new ApiError(
      429,
      { error: { code: "rate_limited", message: "Too many attempts. Try again later." } },
      retryAfter,
    );
  }
}

export function fieldsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(root)";
    fields[key] ??= issue.message;
  }
  return fields;
}

/** Catalog data only changes on deploy, so GET responses can be cached at the edge. */
export const CACHE_PUBLIC = "public, s-maxage=3600, stale-while-revalidate=86400";

export function json<T>(body: T, init: { status?: number; cache?: string; headers?: Record<string, string> } = {}) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: { "Cache-Control": init.cache ?? "no-store", ...init.headers },
  });
}

/**
 * Wraps a route handler: ApiErrors become their JSON response, anything else is
 * logged as one structured line and returned as a generic 500 so internals never leak.
 */
export function handle<Args extends unknown[]>(name: string, fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) {
        const headers: Record<string, string> = err.retryAfter ? { "Retry-After": String(err.retryAfter) } : {};
        return json(err.body, { status: err.status, headers });
      }
      console.error(
        JSON.stringify({
          level: "error",
          route: name,
          message: err instanceof Error ? err.message : String(err),
          // Database drivers wrap the useful error (constraint, connection) as the cause.
          cause: err instanceof Error && err.cause instanceof Error ? err.cause.message : undefined,
          stack: err instanceof Error ? err.stack : undefined,
        }),
      );
      const body: ApiErrorBody = { error: { code: "internal_error", message: "Something went wrong." } };
      return json(body, { status: 500 });
    }
  };
}

/** Reads and parses a JSON body, turning malformed JSON into a 400. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw ApiError.invalid("Request body must be valid JSON.");
  }
}
