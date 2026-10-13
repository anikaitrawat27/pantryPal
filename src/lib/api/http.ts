import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/** The one error shape every endpoint returns. */
export interface ApiErrorBody {
  error: {
    code: "invalid_request" | "not_found" | "internal_error";
    message: string;
    /** For invalid_request: what is wrong with each field, keyed by its path ("meals.2.slug"). */
    fields?: Record<string, string>;
  };
}

/** Thrown inside handlers to return a 4xx without building the response by hand. */
export class ApiError extends Error {
  constructor(
    readonly status: 400 | 404,
    readonly body: ApiErrorBody,
  ) {
    super(body.error.message);
  }

  static invalid(message: string, fields?: Record<string, string>) {
    return new ApiError(400, { error: { code: "invalid_request", message, ...(fields ? { fields } : {}) } });
  }

  static notFound(message: string) {
    return new ApiError(404, { error: { code: "not_found", message } });
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

export function json<T>(body: T, init: { status?: number; cache?: string } = {}) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: { "Cache-Control": init.cache ?? "no-store" },
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
      if (err instanceof ApiError) return json(err.body, { status: err.status });
      console.error(
        JSON.stringify({
          level: "error",
          route: name,
          message: err instanceof Error ? err.message : String(err),
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
