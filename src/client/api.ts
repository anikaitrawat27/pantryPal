import type { ApiErrorBody } from "@/lib/api/http";
import type { ShoppingListBody, ShoppingListResponse } from "@/lib/api/shopping-list";

/** A non-2xx response from the API, carrying its parsed error body when there is one. */
export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(body?.error.message ?? `Request failed with status ${status}`);
  }
}

/**
 * Calls one of this site's API routes. Sends `body` as JSON, returns the parsed JSON
 * response (or null for 204 No Content), and throws ApiClientError on any non-2xx status.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, signal }: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const res = await fetch(path, {
    method,
    signal,
    credentials: "same-origin",
    ...(body === undefined ? {} : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new ApiClientError(res.status, (await res.json().catch(() => null)) as ApiErrorBody | null);
  return (res.status === 204 ? null : await res.json()) as T;
}

export function fetchShoppingList(
  body: Partial<ShoppingListBody> & Pick<ShoppingListBody, "meals">,
  signal?: AbortSignal,
) {
  return apiFetch<ShoppingListResponse>("/api/shopping-list", { method: "POST", body, signal });
}
