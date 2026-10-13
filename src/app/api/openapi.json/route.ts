import { CACHE_PUBLIC, json } from "@/lib/api/http";
import { OPENAPI } from "@/lib/api/openapi";

/** GET /api/openapi.json: machine-readable description of the API. */
export function GET() {
  return json(OPENAPI, { cache: CACHE_PUBLIC });
}
