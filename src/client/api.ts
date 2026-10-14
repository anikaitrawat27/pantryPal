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

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "content-type": "application/json", ...init.headers } });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiClientError(res.status, body);
  }
  return (await res.json()) as T;
}

export function fetchShoppingList(
  body: Partial<ShoppingListBody> & Pick<ShoppingListBody, "meals">,
  signal?: AbortSignal,
) {
  return request<ShoppingListResponse>("/api/shopping-list", { method: "POST", body: JSON.stringify(body), signal });
}
